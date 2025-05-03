/*
 * EscrowService: central service for escrow workflows in the gaming credentials app.
 * JavaScript version using Firestore v9 modular SDK.
 */
import PropTypes from "prop-types";
import {
  getFirestore,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import PaystackPop from "@paystack/inline-js";

export class EscrowService {
  /**
   * @param {Firestore} db Firestore instance
   * @param {number} autoReleaseHours number of hours before auto-release
   */
  constructor(db = getFirestore(), autoReleaseHours = 12) {
    this.db = db;
    this.autoReleaseHours = autoReleaseHours;
  }

  /**
   * Kick off Paystack inline checkout and handle the full flow.
   * @param {object} opts init payment options
   * @param {function} callbacks callbacks: onSuccess, onClose, onError
   */
  async checkout(opts, callbacks = {}) {
    const popup = new PaystackPop();

    popup.checkout({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
      email: opts.email,
      amount: opts.amount * 100,
      currency: opts.currency,
      onSuccess: async (transaction) => {
        await this.handleCheckoutSuccess(transaction.reference, opts);
        callbacks?.onSuccess && (await callbacks?.onSuccess());
      },
      onError: async (err) => {
        callbacks?.onError && (await callbacks?.onError(err));
      },
      onClose: async () => {
        callbacks?.onClose && (await callbacks?.onClose());
      },
    });
  }

  /**
   * Shared success handler: record payment and create escrow.
   * @param {string} ref
   * @param {{ buyerId, sellerId, accountId, itemDescription, accountCredential, amount, currency, email }} opts
   */
  async handleCheckoutSuccess(ref, opts) {
    // 1) Record pending payment
    await setDoc(doc(this.db, "payments", ref), {
      userId: opts.buyerId,
      sellerId: opts.sellerId,
      accountId: opts.accountId,
      itemDescription: opts.itemDescription,
      accountCredential: opts.accountCredential,
      amount: opts.amount,
      currency: opts.currency,
      method: "paystack",
      status: "pending",
      createdAt: serverTimestamp(),
      paidAt: null,
      paymentRef: ref,
      escrowId: null,
      email: opts.email,
    });

    // TODO: verifyPayment(ref) before creating escrow

    // 2) Create escrow record
    const paymentSnap = await getDoc(doc(this.db, "payments", ref));
    const data = paymentSnap.data();
    const autoReleaseAt = Timestamp.fromDate(
      new Date(Date.now() + this.autoReleaseHours * 60 * 60 * 1000)
    );

    await setDoc(doc(this.db, "escrows", ref), {
      id: ref,
      buyerId: data.userId,
      sellerId: data.sellerId,
      paymentId: ref,
      itemDescription: data.itemDescription,
      amount: data.amount,
      currency: data.currency,
      status: "awaiting_feedback",
      buyerConfirmed: false,
      sellerWithdrawn: false,
      createdAt: serverTimestamp(),
      buyerConfirmedAt: null,
      withdrawnAt: null,
      autoReleaseAt,
      cancelRequestBy: null,
      cancellationReviewedByAdmin: false,
      adminNotes: "",
    });
  }

  /**
   * Confirm by buyer.
   * @param {string} ref
   */
  async confirmByBuyer(ref) {
    await setDoc(
      doc(this.db, "escrows", ref),
      {
        status: "buyer_confirmed",
        buyerConfirmed: true,
        buyerConfirmedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Public: orchestrates the entire withdrawal flow for a given escrow.
   * @param {string} ref       Escrow ID / payment reference
   * @param {string} sellerId  Authenticated seller UID
   * @returns {Promise<{ status: string; message: string }>}
   */
  async processWithdrawal(ref, sellerId) {
    // 1) Ensure the seller has funding account details
    await this._ensureWithdrawalAccount(sellerId);

    // 2) Load the escrow record
    const escrow = await this._getEscrow(ref);

    const now = Timestamp.now();
    const { status, autoReleaseAt } = escrow;

    // 3) Branch on escrow state
    if (status === "awaiting_feedback") {
      if (now.toMillis() >= autoReleaseAt.toMillis()) {
        // timeout reached → auto-release
        await this._createWithdrawal(escrow);
        return {
          status: "auto_released",
          message: "Funds auto-released after timeout.",
        };
      } else {
        const msLeft = autoReleaseAt.toMillis() - now.toMillis();
        const hours = Math.ceil(msLeft / (1000 * 60 * 60));
        return {
          status: "waiting",
          message: `Please wait another ${hours}h before auto-release.`,
        };
      }
    }

    if (status === "buyer_confirmed") {
      // buyer explicitly confirmed → create withdrawal
      await this._createWithdrawal(escrow);
      return {
        status: "buyer_confirmed",
        message: "Withdrawal initiated per buyer confirmation.",
      };
    }

    // Otherwise, not eligible
    return {
      status: "not_ready",
      message: `Escrow is in "${status}" state; cannot withdraw yet.`,
    };
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

    // TODO: Process withdrawal using paystack
  }

  /**
   * Dispute an escrow.
   * @param {string} ref
   * @param {string} reason
   */
  async disputeEscrow(ref, reason) {
    await setDoc(
      doc(this.db, "escrows", ref),
      {
        status: "disputed",
        cancelRequestBy: "buyer",
        adminNotes: reason,
      },
      { merge: true }
    );
  }

  /**
   * Admin cancel and refund.
   * @param {string} ref
   * @param {string} notes
   */
  async adminCancel(ref, notes) {
    // TODO: issue refund in Paystack
    await setDoc(
      doc(this.db, "escrows", ref),
      {
        status: "refunded",
        cancellationReviewedByAdmin: true,
        adminNotes: notes,
      },
      { merge: true }
    );
  }
}

// PropTypes for options validation
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
