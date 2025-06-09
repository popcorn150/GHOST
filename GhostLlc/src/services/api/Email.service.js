import axios from "axios";
import validator from "validator";

/**
 * Email service that routes through your backend API with Postmark
 * Supports both test and live modes
 */
export class EmailService {
  constructor(baseApiUrl = import.meta.env.VITE_API_URL || "/api") {
    this.apiUrl = `${baseApiUrl}/email`;
    // Check multiple sources for test mode configuration
    this.isTestMode = import.meta.env.VITE_POSTMARK_TEST_MODE === 'true' || 
                     import.meta.env.MODE === 'test' ||
                     import.meta.env.NODE_ENV === 'test';
    
    console.log("EmailService API URL:", this.apiUrl);
    console.log("EmailService Test Mode:", this.isTestMode ? "ENABLED" : "DISABLED");
    console.log("Environment variables:", {
      VITE_POSTMARK_TEST_MODE: import.meta.env.VITE_POSTMARK_TEST_MODE,
      MODE: import.meta.env.MODE,
      NODE_ENV: import.meta.env.NODE_ENV
    });
  }

  async sendEmail(request, retries = 3) {
    let { from, to, subject, htmlBody, textBody, trackOpens } = request;
    from = from || "support@ghostplay.store"; // Default to support

    // Real implementation: No domain restriction needed in test mode
    if (!validator.isEmail(to)) {
      throw new Error("Invalid recipient email address.");
    }
    if (!validator.isEmail(from)) {
      throw new Error("Invalid sender email address.");
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const logPrefix = this.isTestMode ? "[TEST]" : "[LIVE]";
        console.log(`${logPrefix} Sending email (attempt ${attempt}) with payload:`, {
          from,
          to,
          subject,
        });
        
        const response = await axios.post(
          `${this.apiUrl}/send`,
          { from, to, subject, htmlBody, textBody, trackOpens },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        
        // Log response details including any rerouting info
        if (response.data.testMode) {
          console.log(`${logPrefix} Email simulated successfully:`, response.data);
        } else if (response.data.rerouted) {
          console.log(`${logPrefix} Email rerouted due to pending approval:`, {
            originalRecipient: to,
            actualRecipient: response.data.actualRecipient,
            messageId: response.data.messageId
          });
        } else {
          console.log(`${logPrefix} Email sent successfully:`, response.data);
        }
        
        return response.data;
      } catch (error) {
        const errorDetails = error.response?.data || error.message;
        const logPrefix = this.isTestMode ? "[TEST ERROR]" : "[LIVE ERROR]";
        console.error(`${logPrefix} Attempt ${attempt} failed to send email:`, errorDetails);
        
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
    try {
      const from = "finance@ghostplay.store";
      const logPrefix = this.isTestMode ? "[TEST]" : "[LIVE]";
      console.log(`${logPrefix} Sending account purchased emails for escrow: ${escrowRef}`);
      
      const sellerResponse = await this.sendEmail({
        from,
        to: sellerEmail,
        subject: `Payment Received for Account #${accountId}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Action Required: Verify Account Credentials</h2>
            <p>Buyer ${buyerEmail} has paid for account <strong>#${accountId}</strong>.</p>
            <p>Please log in and ensure all credentials and access details are complete and accurate.</p>
            <p><strong>Reference ID:</strong> ${escrowRef}</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Item:</strong> ${itemDescription}</p>
            <p>Funds are held in escrow until buyer confirmation.</p>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email - no actual payment was processed</em></p>' : ''}
          </div>
        `,
        textBody: `Buyer ${buyerEmail} has paid for account #${accountId}. Reference ID: ${escrowRef}. Amount: ${amount} ${currency}. Please verify credentials.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      
      const buyerResponse = await this.sendEmail({
        from,
        to: buyerEmail,
        subject: `Payment Confirmation - Account #${accountId}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Successful!</h2>
            <p>Thank you for your purchase, ${buyerEmail}!</p>
            <p><strong>Account ID:</strong> #${accountId}</p>
            <p><strong>Reference ID:</strong> ${escrowRef}</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Item:</strong> ${itemDescription}</p>
            <p>Awaiting seller verification.</p>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email - no actual payment was processed</em></p>' : ''}
          </div>
        `,
        textBody: `Payment successful! Account #${accountId}, Reference: ${escrowRef}, Amount: ${amount} ${currency}. Awaiting seller verification.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      
      return { sellerResponse, buyerResponse };
    } catch (error) {
      console.error("Failed to send account purchased emails:", error);
      throw error;
    }
  }

  async sendCredentialRequestEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    accountId,
    requestDetails
  ) {
    try {
      const from = "support@ghostplay.store";
      const response = await this.sendEmail({
        from,
        to: sellerEmail,
        subject: `Credential Request for Account #${accountId}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Additional Credentials Requested</h2>
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            <p><strong>Account ID:</strong> #${accountId}</p>
            <p><strong>Reference ID:</strong> ${escrowRef}</p>
            <p><strong>Request Details:</strong> ${requestDetails}</p>
            <p>Please provide the requested information.</p>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
          </div>
        `,
        textBody: `Credential request for Account #${accountId}. Buyer: ${buyerEmail}. Reference: ${escrowRef}. Details: ${requestDetails}${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      return response;
    } catch (error) {
      console.error("Failed to send credential request emails:", error);
      throw error;
    }
  }

  async sendNewAccountUploadedEmail(
    sellerEmail,
    followerEmails,
    accountId,
    itemDescription,
    price,
    currency
  ) {
    try {
      const from = "updates@ghostplay.store";
      const logPrefix = this.isTestMode ? "[TEST]" : "[LIVE]";
      console.log(`${logPrefix} Sending new account notifications to ${followerEmails.length} followers`);
      
      const followerPromises = followerEmails.map((followerEmail) =>
        this.sendEmail({
          from,
          to: followerEmail,
          subject: `New Account Available from ${sellerEmail}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Account Available</h2>
              <p><strong>Account ID:</strong> #${accountId}</p>
              <p><strong>Description:</strong> ${itemDescription}</p>
              <p><strong>Price:</strong> ${price} ${currency}</p>
              <p>Available for purchase now!</p>
              ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
            </div>
          `,
          textBody: `New account uploaded: ${itemDescription} - ${price} ${currency}. Account ID: #${accountId}. Seller: ${sellerEmail}.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
          trackOpens: true,
        })
      );
      return await Promise.all(followerPromises);
    } catch (error) {
      console.error("Failed to send new account uploaded emails:", error);
      throw error;
    }
  }

  async sendEscrowStatusEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    status,
    details = ""
  ) {
    try {
      const from = "finance@ghostplay.store";
      const logPrefix = this.isTestMode ? "[TEST]" : "[LIVE]";
      console.log(`${logPrefix} Sending escrow status update: ${status} for ${escrowRef}`);
      
      const buyerResponse = await this.sendEmail({
        from,
        to: buyerEmail,
        subject: `Escrow Status Update - ${escrowRef}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Escrow Status: ${status.toUpperCase()}</h2>
            <p><strong>Reference ID:</strong> ${escrowRef}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
            ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
          </div>
        `,
        textBody: `Escrow Status Update: ${status}. Reference ID: ${escrowRef}. ${
          details ? `Details: ${details}` : ""
        }${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      
      const sellerResponse = await this.sendEmail({
        from,
        to: sellerEmail,
        subject: `Escrow Status Update - ${escrowRef}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Escrow Status: ${status.toUpperCase()}</h2>
            <p><strong>Reference ID:</strong> ${escrowRef}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
            ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
          </div>
        `,
        textBody: `Escrow Status Update: ${status}. Reference ID: ${escrowRef}. ${
          details ? `Details: ${details}` : ""
        }${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      
      return { buyerResponse, sellerResponse };
    } catch (error) {
      console.error("Failed to send escrow status emails:", error);
      throw error;
    }
  }

  async sendWeeklyStatsDigest(sellerEmail, stats) {
    try {
      const from = "updates@ghostplay.store";
      const response = await this.sendEmail({
        from,
        to: sellerEmail,
        subject: `Weekly Stats Digest - ${new Date().toLocaleDateString()}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Weekly Stats for ${sellerEmail}</h2>
            <p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Views:</strong> ${stats.views || 0}</p>
              <p><strong>Followers:</strong> ${stats.followers || 0}</p>
              <p><strong>Sales:</strong> ${stats.sales || 0}</p>
              <p><strong>Revenue:</strong> ${stats.revenue || 0} ${
          stats.currency || "NGN"
        }</p>
            </div>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
          </div>
        `,
        textBody: `Weekly Stats for ${sellerEmail}: Views: ${
          stats.views || 0
        }, Followers: ${stats.followers || 0}, Sales: ${
          stats.sales || 0
        }, Revenue: ${stats.revenue || 0} ${stats.currency || "NGN"}.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      return response;
    } catch (error) {
      console.error("Failed to send weekly stats digest:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken, resetUrl) {
    try {
      const from = "support@ghostplay.store";
      const response = await this.sendEmail({
        from,
        to: userEmail,
        subject: "Password Reset Request",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your account: ${userEmail}</p>
            <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore.</p>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email - reset link may not work</em></p>' : ''}
          </div>
        `,
        textBody: `Password reset requested for ${userEmail}. Reset link: ${resetUrl}. Link expires in 1 hour.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      return response;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  }

  async sendLoginAlertEmail(userEmail, loginDetails) {
    try {
      const from = "support@ghostplay.store";
      const response = await this.sendEmail({
        from,
        to: userEmail,
        subject: "New Login to Your Account",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Login Detected</h2>
            <p>We detected a new login to your account: ${userEmail}</p>
            <ul>
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
            <p>If this wasn't you, contact support.</p>
            ${this.isTestMode ? '<p><em>⚠️ This is a test email</em></p>' : ''}
          </div>
        `,
        textBody: `New login detected for ${userEmail}. Time: ${
          loginDetails.timestamp || new Date().toLocaleString()
        }, IP: ${
          loginDetails.ipAddress || "Unknown"
        }. Contact support if unauthorized.${this.isTestMode ? ' [TEST EMAIL]' : ''}`,
        trackOpens: true,
      });
      return response;
    } catch (error) {
      console.error("Failed to send login alert email:", error);
      throw error;
    }
  }

  // Utility method to check if service is in test mode
  getTestMode() {
    return this.isTestMode;
  }

  // Method to manually toggle test mode (useful for development)
  setTestMode(enabled) {
    this.isTestMode = enabled;
    console.log(`EmailService Test Mode: ${enabled ? "ENABLED" : "DISABLED"}`);
  }
}

const emailService = new EmailService();
export default emailService;