import PropTypes from "prop-types";
import PaystackPop from "@paystack/inline-js";
import {
  getFirestore,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import emailService from "./api/Email.service";
import withdrawalService from "./api/Withdrawal.service";

export class EscrowService {
  constructor(db = getFirestore(), autoReleaseHours = 12) {
    this.db = db;
    this.autoReleaseHours = autoReleaseHours;
    this.functions = getFunctions();
  }

  // —————————————————————
  // 1) Buyer-side: make a payment
  // —————————————————————
  async checkout(opts, callbacks = {}) {
    const popup = new PaystackPop();
    popup.checkout({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: opts.email,
      amount: opts.amount * 100,
      currency: opts.currency,
      onSuccess: async (tx) => {
        await this._recordPaymentAndEscrow(tx.reference, opts);
        callbacks.onSuccess?.(tx.reference);
      },
      onError: callbacks.onError,
      onClose: callbacks.onClose,
    });
  }

  async _recordPaymentAndEscrow(ref, opts) {
    // 1. record payment (status=pending_verification)
    await setDoc(doc(this.db, "payments", ref), {
      userId: opts.buyerId,
      sellerId: opts.sellerId,
      accountId: opts.accountId,
      itemDescription: opts.itemDescription,
      accountCredential: opts.accountCredential,
      amount: opts.amount,
      currency: opts.currency,
      method: "paystack",
      status: "pending_verification",
      createdAt: serverTimestamp(),
      paymentRef: ref,
      escrowId: ref,
      email: opts.email,
    });

    // 2. create escrow (pending_verification)
    const autoReleaseAt = Timestamp.fromDate(
      new Date(Date.now() + this.autoReleaseHours * 3600 * 1000)
    );
    await setDoc(doc(this.db, "escrows", ref), {
      id: ref,
      buyerId: opts.buyerId,
      sellerId: opts.sellerId,
      paymentId: ref,
      itemDescription: opts.itemDescription,
      amount: opts.amount,
      currency: opts.currency,
      status: "pending_verification",
      buyerConfirmed: false,
      sellerWithdrawn: false,
      createdAt: serverTimestamp(),
      autoReleaseAt,
      cancelRequestBy: null,
      cancellationReviewedByAdmin: false,
      adminNotes: "",
    });
  }

  async markHolding(escrowRef, reason = "", buyerEmail, sellerEmail) {
    // Update escrow status in database
    await updateDoc(doc(this.db, "escrows", escrowRef), {
      status: "holding",
      adminNotes: reason,
      updatedAt: serverTimestamp(),
    });

    // Send notification emails
    await emailService.sendEscrowStatusEmail(
      escrowRef,
      buyerEmail,
      sellerEmail,
      "holding",
      reason
    );

    return {
      success: true,
      message: "Escrow marked as holding and notifications sent",
    };
  }

  async confirmByBuyer(escrowRef, buyerEmail, sellerEmail) {
    // Update escrow status in database
    await updateDoc(doc(this.db, "escrows", escrowRef), {
      status: "buyer_confirmed",
      buyerConfirmed: true,
      buyerConfirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send notification emails
    await emailService.sendEscrowStatusEmail(
      escrowRef,
      buyerEmail,
      sellerEmail,
      "buyer_confirmed"
    );

    return {
      success: true,
      message: "Escrow confirmed by buyer and notifications sent",
    };
  }

  // —————————————————————
  // 5) Seller uploads bank details
  // —————————————————————
  async uploadBankDetails({ bankAccountNumber, bankCode, fullName }) {
    const fn = httpsCallable(this.functions, "uploadBankDetails");
    const { data } = await fn({ bankAccountNumber, bankCode, fullName });
    return data.recipientCode;
  }

  // —————————————————————
  // 7) Buyer/admin claims refund (mirror withdrawal)
  // —————————————————————
  async requestRefund(ref) {
    // step 1: mark escrow as "refunded" so UI can show refund flow
    await updateDoc(doc(this.db, "escrows", ref), {
      status: "refunded",
      cancellationReviewedByAdmin: true,
    });
    // step 2: frontend collects bank details, then:
    return this.uploadBankDetails();
  }

  // —————————————————————
  // 8) Admin disputes & cancellation
  // —————————————————————
  async disputeEscrow(ref, reason) {
    await updateDoc(doc(this.db, "escrows", ref), {
      status: "disputed",
      cancelRequestBy: "buyer",
      adminNotes: reason,
    });
  }

  async adminCancel(ref, notes) {
    await updateDoc(doc(this.db, "escrows", ref), {
      status: "refunded",
      cancellationReviewedByAdmin: true,
      adminNotes: notes,
    });
  }

  /**
   * Public: process a withdrawal for a seller
   * @param escrowId   - the escrow document ID
   * @param sellerId   - the seller’s user ID
   */
  async processWithdrawal({ escrowId, sellerId }) {
    // 1) Make sure the seller has bank details set up (for UX)
    // await this.ensureBankDetailsOnUser(sellerId);

    // 2) Delegate the heavy lifting to your backend via the WithdrawalService
    return await withdrawalService.processWithdrawal({
      escrowId,
      userId: sellerId,
    });
  }

  /**
   * Private: confirm the seller’s user doc has a Paystack recipient code
   * (so you can prompt “Please add your bank details” before any API call)
   */
  async ensureBankDetailsOnUser(sellerId) {
    const userRef = doc(this.db, "users", sellerId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw new Error("Seller profile not found");
    }

    const data = snap.data();
    if (!data.paystackRecipientCode) {
      const e = new Error(
        "Please set up your bank details before requesting a payout."
      );
      e.code = "NO_BANK_DETAILS";
      throw e;
    }

    // Optionally return their bank data if your UI needs it
    return {
      bankAccountNumber: data.bankAccountNumber,
      bankCode: data.bankCode,
      fullName: data.fullName,
      paystackRecipientCode: data.paystackRecipientCode,
    };
  }
}

// PropTypes for init options
EscrowService.InitPaymentOptionsPropTypes = PropTypes.shape({
  buyerId: PropTypes.string.isRequired,
  sellerId: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  itemDescription: PropTypes.string.isRequired,
  accountCredential: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
});
