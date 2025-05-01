# 💸 Escrow, Payments, and Withdrawals: Schema Documentation

This document explains the structure and purpose of the core payment-related collections used in the system: `Escrow`, `Payment`, and `Withdrawal`. Each field is described in detail, and all enumerated values (e.g., `status`) are documented with their meanings.

---

## 🔐 Escrow Collection

Represents a secure transaction between a buyer and a seller. The escrow protects both parties until the transaction is resolved.

### Fields

| Field                         | Type               | Description                                                                                  |
| ----------------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `id`                          | `string`           | Unique identifier for the escrow record.                                                     |
| `buyerId`                     | `string`           | ID of the buyer initiating the transaction.                                                  |
| `sellerId`                    | `string`           | ID of the seller fulfilling the service or product.                                          |
| `paymentId`                   | `string`           | Reference to the `Payment` document used to fund this escrow.                                |
| `itemDescription`             | `string`           | Description of the product or service being transacted.                                      |
| `amount`                      | `number`           | Total amount held in escrow (in minor units — e.g., kobo or cents).                          |
| `currency`                    | `string`           | ISO 4217 currency code (e.g., `NGN`, `USD`).                                                 |
| `status`                      | `string`           | Current state of the escrow (see table below).                                               |
| `buyerConfirmed`              | `boolean`          | Indicates whether the buyer has confirmed successful delivery or outcome.                    |
| `sellerWithdrawn`             | `boolean`          | Indicates whether the seller has withdrawn the funds from escrow.                            |
| `createdAt`                   | `string`           | ISO timestamp for when the escrow was created.                                               |
| `buyerConfirmedAt`            | `string` or `null` | Timestamp when the buyer confirmed the transaction.                                          |
| `withdrawnAt`                 | `string` or `null` | Timestamp when funds were released to or withdrawn by the seller.                            |
| `autoReleaseAt`               | `string` or `null` | ISO timestamp for when the funds will be auto-released if no feedback is given by the buyer. |
| `cancelRequestBy`             | `string` or `null` | Indicates who requested cancellation (`buyer` or `seller`). See table below.                 |
| `cancellationReviewedByAdmin` | `boolean`          | Indicates whether an admin has reviewed the cancellation request.                            |
| `adminNotes`                  | `string`           | Optional notes or remarks added by the admin during a review or dispute resolution.          |

### Cancel Request By Options

| Value    | Description                                  |
| -------- | -------------------------------------------- |
| `buyer`  | The buyer initiated a cancellation request.  |
| `seller` | The seller initiated a cancellation request. |
| `null`   | No cancellation request has been made yet.   |

### Escrow Status Options

| Status              | Description                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `awaiting_feedback` | Buyer has not provided any feedback yet. `autoReleaseAt` is only active in this state.         |
| `buyer_confirmed`   | Buyer confirmed successful delivery or outcome. Funds will move to seller's available balance. |
| `holding`           | Buyer has given feedback but requires changes/fixes. Funds are still held in escrow.           |
| `disputed`          | Buyer opened a dispute; requires admin intervention.                                           |
| `released`          | Funds have been released from escrow to the seller.                                            |
| `refunded`          | Escrow was refunded back to the buyer after dispute or admin decision.                         |

---

## 💳 Payments Collection

Represents a successful payment made by a buyer to fund an escrow. All successful escrows reference this collection.

### Fields

| Field               | Type               | Description                                                                            |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `id`                | `string`           | Unique identifier for the payment (also used as the document ID).                      |
| `buyerId`           | `string`           | ID of the user who made the payment.                                                   |
| `sellerId`          | `string`           | ID of the seller who will ultimately receive the funds.                                |
| `accountId`         | `string`           | ID of the gaming account (or item) being transacted.                                   |
| `itemDescription`   | `string`           | Brief title or description of the item/service (e.g. “Call of Duty account”).          |
| `accountCredential` | `string`           | The actual credentials or reference to them, encrypted or tokenized.                   |
| `amount`            | `number`           | Amount paid (in minor units — e.g., kobo or cents).                                    |
| `currency`          | `string`           | ISO 4217 currency code (e.g., `NGN`, `USD`).                                           |
| `method`            | `string`           | Payment method used (e.g., `paystack`, `flutterwave`, `remita`).                       |
| `status`            | `string`           | Status of the payment (see **Status Options** below).                                  |
| `paidAt`            | `string` or `null` | ISO timestamp for when the payment was confirmed (set after server-side verification). |
| `createdAt`         | `string`           | ISO timestamp for when the payment attempt was initiated.                              |
| `paymentRef`        | `string`           | Unique reference from the payment provider (e.g., Paystack transaction ID).            |
| `escrowId`          | `string` or `null` | (Optional) Link to the associated escrow record once it’s created.                     |
| `email`             | `string`           | Buyer’s email address (for notifications or receipts).                                 |

#### Payment Status Options

| Status     | Description                                             |
| ---------- | ------------------------------------------------------- |
| `pending`  | Initial state after popup success, before verification. |
| `success`  | Payment was processed and confirmed by the gateway.     |
| `failed`   | Payment failed during processing.                       |
| `refunded` | The payment was refunded to the buyer.                  |

---

## 💸 Withdrawals Collection

Represents a request by a seller to withdraw funds that have been released from escrow.

### Fields

| Field         | Type               | Description                                                         |
| ------------- | ------------------ | ------------------------------------------------------------------- |
| `id`          | `string`           | Unique identifier for the withdrawal request.                       |
| `escrowId`    | `string`           | Reference to the escrow from which the withdrawal is made.          |
| `sellerId`    | `string`           | ID of the seller requesting the withdrawal.                         |
| `amount`      | `number`           | Amount to withdraw (in minor units — e.g., kobo or cents).          |
| `currency`    | `string`           | ISO 4217 currency code (e.g., `NGN`, `USD`).                        |
| `status`      | `string`           | Current state of the withdrawal request (see status options below). |
| `requestedAt` | `string`           | ISO timestamp when the withdrawal was requested.                    |
| `processedAt` | `string` or `null` | ISO timestamp when the withdrawal was processed or failed.          |
| `paymentRef`  | `string` or `null` | Paystack transfer reference (set after successful payout).          |
| `notes`       | `string`           | Optional notes from admin or system regarding the withdrawal.       |

### Withdrawal Status Options

| Status     | Description                                        |
| ---------- | -------------------------------------------------- |
| `pending`  | Withdrawal has been requested and is under review. |
| `approved` | Admin has approved the withdrawal for payout.      |
| `paid`     | Withdrawal has been successfully processed.        |
| `failed`   | Withdrawal attempt failed — requires attention.    |

## 🧠 Notes for Developers

- `autoReleaseAt` in Escrow is critical for timeout logic. Use a background job or scheduler to release funds if this time passes and no feedback has been received.
- Only escrows in the `buyer_confirmed` state should count toward available balance for sellers and become eligible for withdrawal.
- `paymentRef` in both Payments and Withdrawals should be used for reconciliation with Paystack or other gateways.
- Time fields (`createdAt`, `requestedAt`, etc.) are all in ISO 8601 format.
- All amounts are stored in **minor currency units** (e.g., `2500` NGN = ₦25.00) to prevent floating-point errors.

---

## ✅ Example Flow Summary

1. **Buyer pays →** Payment record is created (`status: success`) → Escrow is created with `status: awaiting_feedback`.
2. **Buyer responds:**
   - If happy → `status: buyer_confirmed` → Seller eligible for withdrawal.
   - If changes are needed → `status: holding`.
   - No response → check `autoReleaseAt`, and auto-release after timeout.
3. **Seller requests withdrawal** → Creates a Withdrawal with `status: pending` → Admin or system processes → Status moves to `paid` or `failed`.

---

Feel free to extend this document if new statuses or flows are introduced.
