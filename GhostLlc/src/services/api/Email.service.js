import axios from "axios";
import validator from "validator";

/**
 * Email service that routes through your backend API with Postmark
 * Now supports live mode with proper email type routing
 */
export class EmailService {
  constructor(baseApiUrl = import.meta.env.VITE_API_URL || "/api") {
    this.apiUrl = `${baseApiUrl}/email`;
    console.log("EmailService API URL:", this.apiUrl);
    console.log("EmailService Mode: LIVE");
  }

  async sendEmail(request, retries = 3) {
    let { from, to, subject, htmlBody, textBody, trackOpens, emailType } =
      request;

    // Email validation
    if (!validator.isEmail(to)) {
      throw new Error("Invalid recipient email address.");
    }
    if (from && !validator.isEmail(from)) {
      throw new Error("Invalid sender email address.");
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[LIVE] Sending email (attempt ${attempt}) with payload:`, {
          from,
          to,
          subject,
          emailType,
        });

        const response = await axios.post(
          `${this.apiUrl}/send`,
          { from, to, subject, htmlBody, textBody, trackOpens, emailType },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("[LIVE] Email sent successfully:", response.data);
        return response.data;
      } catch (error) {
        const errorDetails = error.response?.data || error.message;
        console.error(
          `[LIVE ERROR] Attempt ${attempt} failed to send email:`,
          errorDetails
        );

        if (attempt === retries) {
          throw new Error(
            `Email sending failed: ${JSON.stringify(errorDetails)}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async sendAccountPurchasedEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    accountId,
    itemDescription,
    amount,
    currency
  ) {
    console.log(
      `[LIVE] Sending account purchased emails for escrow: ${escrowRef}`
    );

    const sellerResponse = await this.sendEmail({
      to: sellerEmail,
      subject: `Payment Received for Account #${accountId}`,
      emailType: "finance",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Action Required: Verify Account Credentials</h2>
          <p>Buyer ${buyerEmail} has paid for account <strong>#${accountId}</strong>.</p>
          <p>Please log in and ensure all credentials and access details are complete and accurate.</p>
          <p><strong>Reference ID:</strong> ${escrowRef}</p>
          <p><strong>Amount:</strong> ${amount} ${currency}</p>
          <p><strong>Item:</strong> ${itemDescription}</p>
          <p>Funds are held in escrow until buyer confirmation.</p>
        </div>
      `,
      textBody: `Buyer ${buyerEmail} has paid for account #${accountId}. Reference ID: ${escrowRef}. Amount: ${amount} ${currency}. Please verify credentials.`,
      trackOpens: true,
    });

    const buyerResponse = await this.sendEmail({
      to: buyerEmail,
      subject: `Payment Confirmation - Account #${accountId}`,
      emailType: "finance",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase, ${buyerEmail}!</p>
          <p><strong>Account ID:</strong> #${accountId}</p>
          <p><strong>Reference ID:</strong> ${escrowRef}</p>
          <p><strong>Amount:</strong> ${amount} ${currency}</p>
          <p><strong>Item:</strong> ${itemDescription}</p>
          <p>Awaiting seller verification.</p>
        </div>
      `,
      textBody: `Payment successful! Account #${accountId}, Reference: ${escrowRef}, Amount: ${amount} ${currency}. Awaiting seller verification.`,
      trackOpens: true,
    });

    return { sellerResponse, buyerResponse };
  }

  async sendCredentialRequestEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    accountId,
    requestDetails
  ) {
    const response = await this.sendEmail({
      to: sellerEmail,
      subject: `Credential Request for Account #${accountId}`,
      emailType: "support",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Additional Credentials Requested</h2>
          <p><strong>Buyer:</strong> ${buyerEmail}</p>
          <p><strong>Account ID:</strong> #${accountId}</p>
          <p><strong>Reference ID:</strong> ${escrowRef}</p>
          <p><strong>Request Details:</strong> ${requestDetails}</p>
          <p>Please provide the requested information.</p>
        </div>
      `,
      textBody: `Credential request for Account #${accountId}. Buyer: ${buyerEmail}. Reference: ${escrowRef}. Details: ${requestDetails}`,
      trackOpens: true,
    });
    return response;
  }

  async sendNewAccountUploadedEmail(
    sellerEmail,
    followerEmails,
    accountId,
    itemDescription,
    price,
    currency
  ) {
    console.log(
      `[LIVE] Sending new account notifications to ${followerEmails.length} followers`
    );

    const followerPromises = followerEmails.map((followerEmail) =>
      this.sendEmail({
        to: followerEmail,
        subject: `New Account Available from ${sellerEmail}`,
        emailType: "updates",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🎮 New Account Available!</h2>
            <p>A seller you follow has uploaded a new account:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Account ID:</strong> #${accountId}</p>
              <p><strong>Description:</strong> ${itemDescription}</p>
              <p><strong>Price:</strong> ${price} ${currency}</p>
              <p><strong>Seller:</strong> ${sellerEmail}</p>
            </div>
            <p>🚀 Available for purchase now on GhostPlay!</p>
          </div>
        `,
        textBody: `New account uploaded: ${itemDescription} - ${price} ${currency}. Account ID: #${accountId}. Seller: ${sellerEmail}.`,
        trackOpens: true,
      })
    );
    return await Promise.all(followerPromises);
  }

  async sendEscrowStatusEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    status,
    details = ""
  ) {
    console.log(
      `[LIVE] Sending escrow status update: ${status} for ${escrowRef}`
    );

    const buyerResponse = await this.sendEmail({
      to: buyerEmail,
      subject: `Escrow Status Update - ${escrowRef}`,
      emailType: "finance",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>💰 Escrow Status: ${status.toUpperCase()}</h2>
          <p><strong>Reference ID:</strong> ${escrowRef}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>What this means:</strong></p>
            ${this.getStatusExplanation(status, "buyer")}
          </div>
        </div>
      `,
      textBody: `Escrow Status Update: ${status}. Reference ID: ${escrowRef}. ${
        details ? `Details: ${details}` : ""
      }`,
      trackOpens: true,
    });

    const sellerResponse = await this.sendEmail({
      to: sellerEmail,
      subject: `Escrow Status Update - ${escrowRef}`,
      emailType: "finance",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>💰 Escrow Status: ${status.toUpperCase()}</h2>
          <p><strong>Reference ID:</strong> ${escrowRef}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>What this means:</strong></p>
            ${this.getStatusExplanation(status, "seller")}
          </div>
        </div>
      `,
      textBody: `Escrow Status Update: ${status}. Reference ID: ${escrowRef}. ${
        details ? `Details: ${details}` : ""
      }`,
      trackOpens: true,
    });

    return { buyerResponse, sellerResponse };
  }

  getStatusExplanation(status, userType) {
    const explanations = {
      pending: {
        buyer:
          "<p>Your payment is being processed. You'll be notified once the seller verifies the account credentials.</p>",
        seller:
          "<p>Payment received! Please verify and complete the account credentials for the buyer.</p>",
      },
      verified: {
        buyer:
          "<p>The seller has verified the account. You can now access your purchase details.</p>",
        seller:
          "<p>Account verified successfully. Funds will be released once the buyer confirms receipt.</p>",
      },
      completed: {
        buyer: "<p>Transaction completed! Your account is ready for use.</p>",
        seller:
          "<p>Transaction completed! Funds have been released to your account.</p>",
      },
      disputed: {
        buyer:
          "<p>There's an issue with this transaction. Our support team will contact you shortly.</p>",
        seller:
          "<p>The buyer has raised a concern. Our support team will mediate this transaction.</p>",
      },
      refunded: {
        buyer:
          "<p>Your payment has been refunded and will appear in your account within 3-5 business days.</p>",
        seller: "<p>This transaction has been refunded to the buyer.</p>",
      },
    };

    return explanations[status]?.[userType] || "<p>Status update received.</p>";
  }

  async sendWeeklyStatsDigest(sellerEmail, stats) {
    const response = await this.sendEmail({
      to: sellerEmail,
      subject: `📊 Weekly Stats Digest - ${new Date().toLocaleDateString()}`,
      emailType: "updates",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📈 Weekly Performance for ${sellerEmail}</h2>
          <p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: white;">Your Weekly Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Profile Views</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${
                  stats.views || 0
                }</p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">New Followers</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${
                  stats.followers || 0
                }</p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Sales Made</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${
                  stats.sales || 0
                }</p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Revenue Earned</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${
                  stats.revenue || 0
                } ${stats.currency || "NGN"}</p>
              </div>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>💡 Tips to Improve:</h4>
            <ul>
              <li>Upload more accounts to increase visibility</li>
              <li>Update your profile with detailed descriptions</li>
              <li>Respond quickly to buyer inquiries</li>
              <li>Maintain high-quality account credentials</li>
            </ul>
          </div>
        </div>
      `,
      textBody: `Weekly Stats for ${sellerEmail}: Views: ${
        stats.views || 0
      }, Followers: ${stats.followers || 0}, Sales: ${
        stats.sales || 0
      }, Revenue: ${stats.revenue || 0} ${stats.currency || "NGN"}`,
      trackOpens: true,
    });
    return response;
  }

  async sendPasswordResetEmail(userEmail, resetToken, resetUrl) {
    const response = await this.sendEmail({
      to: userEmail,
      subject: "🔐 Password Reset Request",
      emailType: "noreply",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px;">
            <h2 style="color: #333;">🔐 Password Reset Request</h2>
            <p style="font-size: 16px; color: #666;">You requested a password reset for your GhostPlay account:</p>
            <p style="font-size: 18px; font-weight: bold; color: #333;">${userEmail}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This link expires in 1 hour for security reasons.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
      `,
      textBody: `Password reset requested for ${userEmail}. Reset link: ${resetUrl}. Link expires in 1 hour. If you didn't request this, please ignore this email.`,
      trackOpens: true,
    });
    return response;
  }

  async sendLoginAlertEmail(userEmail, loginDetails) {
    const response = await this.sendEmail({
      to: userEmail,
      subject: "🚨 New Login Detected",
      emailType: "noreply",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; color: white;">🚨 Security Alert: New Login Detected</h2>
          </div>
          
          <div style="border: 1px solid #dc3545; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>We detected a new login to your GhostPlay account:</p>
            <p style="font-size: 18px; font-weight: bold; color: #333;">${userEmail}</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0;">Login Details:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Time:</strong> ${
                  loginDetails.timestamp || new Date().toLocaleString()
                }</li>
                <li><strong>IP Address:</strong> ${
                  loginDetails.ipAddress || "Unknown"
                }</li>
                <li><strong>Device:</strong> ${
                  loginDetails.device || "Unknown"
                }</li>
                <li><strong>Location:</strong> ${
                  loginDetails.location || "Unknown"
                }</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ If this wasn't you:</strong> Please contact our support team immediately and consider changing your password.</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="mailto:support@ghostplay.store" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Contact Support</a>
            </div>
          </div>
        </div>
      `,
      textBody: `SECURITY ALERT: New login detected for ${userEmail}. Time: ${
        loginDetails.timestamp || new Date().toLocaleString()
      }, IP: ${loginDetails.ipAddress || "Unknown"}, Device: ${
        loginDetails.device || "Unknown"
      }, Location: ${
        loginDetails.location || "Unknown"
      }. If this wasn't you, contact support immediately.`,
      trackOpens: true,
    });
    return response;
  }

  async sendNoReplyEmail(to, subject, htmlBody, textBody = null) {
    const enhancedHtmlBody =
      htmlBody +
      `
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-size: 12px; color: #6c757d; border-top: 2px solid #dee2e6;">
          <p style="margin: 0 0 10px 0;"><strong>📧 This is an automated email</strong></p>
          <p style="margin: 0;">Please do not reply to this message. If you need assistance, contact our support team at <a href="mailto:support@ghostplay.store" style="color: #007bff;">support@ghostplay.store</a></p>
        </div>
      `;

    const enhancedTextBody =
      (textBody || "") +
      `\n\n---\n📧 AUTOMATED EMAIL - DO NOT REPLY\nThis is an automated email. Please do not reply to this message.\nFor assistance, contact support@ghostplay.store`;

    return await this.sendEmail({
      to,
      subject,
      htmlBody: enhancedHtmlBody,
      textBody: enhancedTextBody,
      emailType: "noreply",
      trackOpens: true,
    });
  }

  // New method for handling inbound email processing
  async processInboundEmail(inboundData) {
    try {
      console.log("[LIVE] Processing inbound email locally:", inboundData);

      const response = await axios.post(
        `${this.apiUrl}/inbound-email`,
        inboundData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("[LIVE] Inbound email processed:", response.data);
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error(
        "[LIVE ERROR] Failed to process inbound email:",
        errorDetails
      );
      throw new Error(
        `Inbound email processing failed: ${JSON.stringify(errorDetails)}`
      );
    }
  }

  // Method to get email configuration from backend
  async getEmailConfig() {
    try {
      const response = await axios.get(`${this.apiUrl}/config`);
      return response.data;
    } catch (error) {
      console.error("Failed to get email config:", error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.apiUrl.replace("/email", "")}/health`
      );
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
