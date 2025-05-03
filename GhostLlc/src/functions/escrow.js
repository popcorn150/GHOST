const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Your Paystack secret key (store this in Firebase environment config)
const PAYSTACK_SECRET_KEY = functions.config().paystack.secret;
const PAYSTACK_WEBHOOK_SECRET = functions.config().paystack.webhook_secret;

// Utility to generate random ID
function generateRandomId(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Verify Paystack signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.error("Invalid Paystack signature");
    return res.status(403).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const paymentData = event.data;
    const reference = paymentData.reference;

    try {
      // Verify transaction again with Paystack
      const verifyResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const verifiedPayment = verifyResponse.data.data;

      if (verifiedPayment.status !== "success") {
        throw new Error("Verified transaction not successful");
      }

      // Update escrow
      const escrowRef = db.collection("escrows").doc(reference);
      await escrowRef.update({
        status: "awaiting_feedback",
        paymentVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Optionally, update payment status
      const paymentRef = db.collection("payments").doc(reference);
      await paymentRef.update({
        status: "success",
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).send("Payment processed and escrow created");
    } catch (err) {
      console.error("Error processing Paystack webhook:", err);
      return res.status(500).send("Internal error");
    }
  }

  return res.status(200).send("Event ignored");
});

/**
 * Process withdrawal from escrow to seller's account
 */
exports.processWithdrawal = functions.https.onCall(async (data, context) => {
  const { escrowId, withdrawalId } = data;

  if (!escrowId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Escrow ID is required"
    );
  }
  if (!withdrawalId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Withdrawal ID is required"
    );
  }

  try {
    // Fetch escrow
    const escrowDoc = await db.collection("escrows").doc(escrowId).get();
    if (!escrowDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Escrow not found");
    }
    const escrow = escrowDoc.data();

    // Fetch withdrawal
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    const withdrawalDoc = await withdrawalRef.get();
    if (!withdrawalDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Withdrawal record not found"
      );
    }
    const withdrawal = withdrawalDoc.data();
    const transferReference = withdrawal.transferReference;

    // Initiate Paystack transfer
    const transferResp = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.round(escrow.amount * 100), // Convert to kobo
        recipient: escrow.paystackRecipientCode,
        reason: `Payment for escrow ${escrowId}`,
        reference: transferReference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transferData = transferResp.data.data;

    // Update withdrawal with status and transfer code
    await withdrawalRef.update({
      status: transferData.status === "success" ? "paid" : "pending",
      paymentRef: transferData.transfer_code,
    });

    // Update escrow status
    await db.collection("escrows").doc(escrowId).update({
      status: "released",
      sellerWithdrawn: true,
      withdrawnAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      withdrawalId,
      transferCode: transferData.transfer_code,
      status: transferData.status,
    };
  } catch (error) {
    console.error("Withdrawal processing error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the withdrawal",
      error.message
    );
  }
});

exports.uploadBankDetails = functions.https.onCall(async (data, context) => {
  const { bankAccountNumber, bankCode, fullName } = data;
  const userId = context.auth?.uid;

  if (!userId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  if (!bankAccountNumber || !bankCode || !fullName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing bank details"
    );
  }

  try {
    const recipientResp = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name: fullName,
        account_number: bankAccountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const recipientCode = recipientResp.data.data.recipient_code;

    await db.collection("users").doc(userId).update({
      bankAccountNumber,
      bankCode,
      fullName,
      paystackRecipientCode: recipientCode,
    });

    return { success: true, recipientCode };
  } catch (error) {
    console.error("Bank setup error:", error);
    if (error.response?.data) {
      throw new functions.https.HttpsError(
        "internal",
        error.response.data.message
      );
    }
    throw new functions.https.HttpsError(
      "internal",
      "Unexpected error",
      error.message
    );
  }
});

/**
 * Webhook handler for Paystack events
 * This allows you to automatically update transfer status
 */
exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  try {
    const { reference } = event.data;
    const withdrawals = await db
      .collection("withdrawals")
      .where("transferReference", "==", reference)
      .limit(1)
      .get();

    if (withdrawals.empty)
      return res.status(200).send("No matching withdrawal");

    const withdrawalRef = withdrawals.docs[0].ref;

    if (event.event === "transfer.success") {
      await withdrawalRef.update({
        status: "paid",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentRef: event.data.transfer_code,
      });
    } else if (event.event === "transfer.failed") {
      await withdrawalRef.update({
        status: "failed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Transfer failed: ${
          event.data.failures?.reason || "Unknown reason"
        }`,
      });

      // Optional rollback if needed
      const escrowId = withdrawals.docs[0].data().escrowId;
      await db.collection("escrows").doc(escrowId).update({
        status: "buyer_confirmed",
        sellerWithdrawn: false,
        withdrawnAt: null,
      });
    }

    return res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Server error");
  }
});
