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

  // —————————————————————
  // 2) Frontend verification trigger
  // —————————————————————
  async verifyPayment(ref) {
    const fn = httpsCallable(this.functions, "verifyPaystackPayment");
    const { data } = await fn({ reference: ref });
    // expect backend to update payment.status => 'success' and escrow.status => 'awaiting_feedback' or 'holding'
    return data;
  }

  // —————————————————————
  // 3) Buyer marks “holding” (needs seller fix)
  // —————————————————————
  async markHolding(ref, reason = "") {
    await updateDoc(doc(this.db, "escrows", ref), {
      status: "holding",
      adminNotes: reason,
    });
  }

  // —————————————————————
  // 4) Buyer confirms final delivery
  // —————————————————————
  async confirmByBuyer(ref) {
    await updateDoc(doc(this.db, "escrows", ref), {
      status: "buyer_confirmed",
      buyerConfirmed: true,
      buyerConfirmedAt: serverTimestamp(),
    });
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
  // 6) Seller requests a withdrawal
  // —————————————————————
  async requestWithdrawal(ref) {
    const fn = httpsCallable(this.functions, "processWithdrawal");
    const { data } = await fn({ escrowId: ref });
    return data; // { success, withdrawalId, transferCode, status }
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
    return this.uploadBankDetails(/* same shape */);
  }

  async processRefund(ref) {
    // call the same backend fn, but direct funds back to buyer
    const fn = httpsCallable(this.functions, "processWithdrawal");
    return fn({ escrowId: ref });
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

  async processWithdrawal(escrowId, sellerId) {
    // 1) Ensure bank details exist
    await this._ensureWithdrawalAccount(sellerId);

    // 2) Load escrow and branch on state/autoRelease
    const escrowSnap = await getDoc(doc(this.db, "escrows", escrowId));
    if (!escrowSnap.exists()) throw new Error("Escrow not found");
    const escrow = escrowSnap.data();
    if (escrow.sellerWithdrawn) throw new Error("Funds already withdrawn");

    const now = Timestamp.now();
    const { status, autoReleaseAt } = escrow;
    if (status === "awaiting_feedback") {
      if (now.toMillis() < autoReleaseAt.toMillis()) {
        const hrs = Math.ceil(
          (autoReleaseAt.toMillis() - now.toMillis()) / 3600000
        );
        throw new Error(`Please wait ${hrs}h for auto-release`);
      }
    } else if (status !== "buyer_confirmed") {
      throw new Error(`Escrow in "${status}", cannot withdraw`);
    }

    // 3) Create the Firestore record for withdrawal
    const withdrawalId = `withdrawal_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await setDoc(doc(this.db, "withdrawals", withdrawalId), {
      id: withdrawalId,
      escrowId,
      sellerId,
      amount: escrow.amount,
      currency: escrow.currency,
      status: "pending",
      requestedAt: serverTimestamp(),
      processedAt: null,
      paymentRef: null,
      notes: "",
    });

    // 4) Call your Cloud Function to perform the transfer
    const fn = httpsCallable(this.functions, "processWithdrawal");
    const result = await fn({ escrowId, withdrawalId });
    // result should contain { success, transferCode, status, withdrawalId }

    // 5) Update local withdrawal/status if needed
    await updateDoc(doc(this.db, "withdrawals", withdrawalId), {
      status: result.data.status,
      paymentRef: result.data.transferCode,
      processedAt: serverTimestamp(),
    });
    await updateDoc(doc(this.db, "escrows", escrowId), {
      status: "released",
      sellerWithdrawn: true,
      withdrawnAt: serverTimestamp(),
    });

    return result.data;
  }

  // Check the seller has configured a withdrawal account
  async _ensureWithdrawalAccount(sellerId) {
    const acctSnap = await getDoc(doc(this.db, "withdrawalAccounts", sellerId));
    if (!acctSnap.exists()) {
      throw new Error(
        "Please set up your withdrawal account before requesting a payout."
      );
    }
    // Return acctSnap.data() for downstream logic
    return acctSnap.data();
  }

  // Load and return escrow data
  async _getEscrow(ref) {
    const snap = await getDoc(doc(this.db, "escrows", ref));
    if (!snap.exists()) {
      throw new Error("Escrow not found");
    }
    return snap.data();
  }

  // Actually create the withdrawal document
  async _createWithdrawal(escrow) {
    const withdrawalId = `withdrawal_${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    await setDoc(doc(this.db, "withdrawals", withdrawalId), {
      id: withdrawalId,
      escrowId: escrow.id,
      sellerId: escrow.sellerId,
      amount: escrow.amount,
      currency: escrow.currency,
      status: "pending",
      requestedAt: serverTimestamp(),
      processedAt: null,
      paymentRef: null,
      notes: "",
    });
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
