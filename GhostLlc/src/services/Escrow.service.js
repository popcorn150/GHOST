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
import { getNetAmount } from "../utils/getNetAmount";
// Fix: Use default import for validator
import validator from "validator";

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
    // Log opts for debugging
    console.log("Checkout called with opts:", JSON.stringify(opts, null, 2));

    // Validate required fields
    if (
      !opts.buyerId ||
      !opts.sellerId ||
      !opts.accountId ||
      !opts.itemDescription ||
      !opts.accountCredential ||
      !opts.amount ||
      !opts.currency
    ) {
      console.error("Missing required fields in checkout:", opts);
      throw new Error("Missing required checkout fields");
    }
    
    // Fix: Add null/undefined check before validator call
    if (!opts.email || !validator.isEmail(opts.email)) {
      console.error("Invalid or missing buyer email in checkout:", opts.email);
      throw new Error("Invalid buyer email provided");
    }

    // Fetch sellerEmail from Firestore if not provided
    let sellerEmail = opts.sellerEmail;
    if (!sellerEmail) {
      try {
        const sellerDoc = await getDoc(doc(this.db, "users", opts.sellerId));
        if (!sellerDoc.exists()) {
          console.error(
            "Seller profile not found for sellerId:",
            opts.sellerId
          );
          throw new Error("Seller profile not found");
        }
        sellerEmail = sellerDoc.data().email;
        if (!sellerEmail || !validator.isEmail(sellerEmail)) {
          console.error(
            "Invalid or missing email in seller profile:",
            sellerEmail
          );
          throw new Error("Invalid seller email in profile");
        }
      } catch (error) {
        console.error("Failed to fetch seller email:", error);
        throw new Error("Unable to fetch seller email");
      }
    } else if (!validator.isEmail(sellerEmail)) {
      console.error("Invalid seller email provided:", sellerEmail);
      throw new Error("Invalid seller email provided");
    }

    // Update opts with fetched sellerEmail
    const validatedOpts = { ...opts, sellerEmail };

    const popup = new PaystackPop();
    popup.checkout({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: validatedOpts.email,
      amount: validatedOpts.amount * 100,
      currency: validatedOpts.currency,
      onSuccess: async (tx) => {
        try {
          await this._recordPaymentAndEscrow(tx.reference, validatedOpts);
          callbacks.onSuccess?.(tx.reference);
        } catch (error) {
          console.error("Error in onSuccess callback:", error);
          callbacks.onError?.(error);
        }
      },
      onError: (error) => {
        console.error("Paystack checkout error:", error);
        callbacks.onError?.(error);
      },
      onClose: callbacks.onClose,
    });
  }

  async _recordPaymentAndEscrow(ref, opts) {
    // Validate sellerEmail
    if (!opts.sellerEmail || !validator.isEmail(opts.sellerEmail)) {
      console.error("Invalid or missing seller email:", opts.sellerEmail);
      throw new Error("Invalid seller email provided");
    }

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
      amount: getNetAmount({
        amountPaid: opts.amount,
        currency: opts.currency,
      }),
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

    // 3. notify seller to verify credentials
    await emailService.sendAccountPurchasedEmail(
      ref,
      opts.email,
      opts.sellerEmail,
      opts.accountId,
      opts.itemDescription,
      opts.amount,
      opts.currency
    );
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
   * @param sellerId   - the seller's user ID
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
   * Private: confirm the seller's user doc has a Paystack recipient code
   * (so you can prompt "Please add your bank details" before any API call)
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
  sellerEmail: PropTypes.string, // Optional since we fetch from Firestore
});