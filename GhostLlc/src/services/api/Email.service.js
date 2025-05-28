// src/services/email.service.ts
import axios from "axios";

/**
 * Email service for sending emails through the API
 */
export class EmailService {
  constructor(baseApiUrl = import.meta.env.VITE_API_URL || "/api") {
    this.apiUrl = `${baseApiUrl}/email`;
  }

  /**
   * Send an email
   * @param request Email request data
   * @returns Promise with response data
   */
  async sendEmail(request) {
    try {
      const response = await axios.post(`${this.apiUrl}/send`, request);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to send email:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send an escrow status notification email
   * @param escrowRef Escrow reference ID
   * @param buyerEmail Buyer's email
   * @param sellerEmail Seller's email
   * @param status New escrow status
   * @param details Optional details about the status change
   * @returns Promise with response data
   */
  async sendEscrowStatusEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    status,
    details
  ) {
    const statusActions = {
      holding: {
        subject: `Action Required: Escrow #${escrowRef} Marked as Holding`,
        buyerMessage: `You have marked the escrow #${escrowRef} as holding. The seller has been notified and will address the issues.`,
        sellerMessage: `The buyer has marked escrow #${escrowRef} as holding. Please review and fix the issues to proceed with the transaction.`,
      },
      buyer_confirmed: {
        subject: `Transaction Completed: Escrow #${escrowRef} Confirmed`,
        buyerMessage: `You have confirmed the delivery for escrow #${escrowRef}. The transaction is now complete.`,
        sellerMessage: `Great news! The buyer has confirmed the delivery for escrow #${escrowRef}. The transaction is now complete.`,
      },
    };

    // Send email to buyer
    await this.sendEmail({
      to: buyerEmail,
      subject: statusActions[status].subject,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Escrow Status Update</h2>
          <p>${statusActions[status].buyerMessage}</p>
          ${
            details
              ? `<p><strong>Additional details:</strong> ${details}</p>`
              : ""
          }
          <p>Reference ID: ${escrowRef}</p>
          <p>Status: ${status === "holding" ? "On Hold" : "Confirmed"}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      `,
      trackOpens: true,
    });

    // Send email to seller
    await this.sendEmail({
      to: sellerEmail,
      subject: statusActions[status].subject,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Escrow Status Update</h2>
          <p>${statusActions[status].sellerMessage}</p>
          ${
            details
              ? `<p><strong>Additional details:</strong> ${details}</p>`
              : ""
          }
          <p>Reference ID: ${escrowRef}</p>
          <p>Status: ${status === "holding" ? "On Hold" : "Confirmed"}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      `,
      trackOpens: true,
    });

    return {
      success: true,
      message: `Escrow status emails sent to buyer and seller for status: ${status}`,
    };
  }
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService;
