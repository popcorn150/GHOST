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

  // Enhanced method for specific credential requests with 3-hour deadline
  async sendSpecificCredentialRequestEmail(
    escrowRef,
    buyerEmail,
    sellerEmail,
    accountId,
    missingCredentials = [],
    accountDetails = {}
  ) {
    const credentialMapping = {
      facebook: { name: "Facebook", icon: "📘", priority: "high" },
      google: { name: "Google", icon: "🔍", priority: "high" },
      icloud: { name: "iCloud/Apple ID", icon: "🍎", priority: "critical" },
      accountNotFound: {
        name: "Account Access Issue",
        icon: "❌",
        priority: "critical",
      },
    };

    // Generate specific credential list
    const missingCredentialsList = missingCredentials
      .map((cred) => {
        const mapping = credentialMapping[cred] || {
          name: cred,
          icon: "🔗",
          priority: "medium",
        };
        return `${mapping.icon} ${mapping.name}`;
      })
      .join("<br>");

    const priorityLevel = missingCredentials.some(
      (cred) => credentialMapping[cred]?.priority === "critical"
    )
      ? "CRITICAL"
      : "HIGH";

    const deadlineTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
    const formattedDeadline = deadlineTime.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Email to seller with specific requirements
    const sellerResponse = await this.sendEmail({
      to: sellerEmail,
      subject: `🚨 URGENT: Missing Credentials for Account #${accountId} - 3 Hours Deadline`,
      emailType: "support",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc3545;">
          <!-- Header with urgency indicator -->
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: white;">🚨 URGENT ACTION REQUIRED</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Missing Credentials Detected</p>
          </div>

          <!-- Priority Badge -->
          <div style="background: #fff3cd; border-bottom: 2px solid #ffc107; padding: 15px; text-align: center;">
            <span style="background: #dc3545; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              ${priorityLevel} PRIORITY
            </span>
          </div>

          <div style="padding: 20px; background: white;">
            <!-- Transaction Details -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Transaction Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Account ID:</strong> #${accountId}</p>
              <p style="margin: 5px  businesses for sale 0; color: #666;"><strong>Buyer:</strong> ${buyerEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Reference ID:</strong> ${escrowRef}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Account Description:</strong> ${
                accountDetails.description || "N/A"
              }</p>
            </div>

            <!-- Missing Credentials -->
            <div style="background: #fff5f5; border: 2px solid #fed7d7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #c53030;">❌ Missing Credentials Identified</h3>
              <p style="margin: 0 0 15px 0; color: #4a5568;">The buyer has verified the account and found the following linked accounts/credentials are missing or inaccessible:</p>
              
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
                ${missingCredentialsList}
              </div>
            </div>

            <!-- Countdown Timer Section -->
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: white;">⏰ DEADLINE</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold;">${formattedDeadline}</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">You have exactly 3から hours to provide the missing credentials</p>
            </div>

            <!-- Required Actions -->
            <div style="background: #e6fffa; border: 2px solid #38b2ac; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #2c7a7b;">✅ Required Actions</h3>
              <ol style="margin: 0; padding-left: 20px; color: #4a5568;">
                <li style="margin-bottom: 10px;"><strong>Immediately log into the account</strong> and verify all linked services</li>
                <li style="margin-bottom: 10px;"><strong>Provide complete access</strong> to all missing credentials listed above</li>
                <li style="margin-bottom: 10px;"><strong>Update account recovery information</strong> (phone numbers, backup emails)</li>
                <li style="margin-bottom: 10px;"><strong>Remove any personal information</strong> that could compromise the account</li>
                <li style="margin-bottom: 10px;"><strong>Contact the buyer directly</strong> to confirm credential access</li>
              </ol>
            </div>

            <!-- Warning Section -->
            <div style="background: #fed7d7; border: 2px solid #fc8181; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #c53030;">⚠️ Important Warning</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
                <li style="margin-bottom: 8px;">Failure to provide missing credentials within 3 hours will result in <strong>automatic escrow hold</strong></li>
                <li style="margin-bottom: 8px;">Extended delays may lead to <strong>transaction cancellation and refund</strong></li>
                <li style="margin-bottom: 8px;">Your seller rating will be <strong>negatively affected</strong> by incomplete deliveries</li>
                <li style="margin-bottom: 8px;">Repeated violations may result in <strong>account suspension</strong></li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="margin: 0 0 15px 0; color: #666;">Need help? Contact our support team:</p>
              <a href="mailto:support@ghostplay.store" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Contact Support</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">This is an automated message from GhostPlay. Please respond promptly to avoid transaction complications.</p>
          </div>
        </div>
      `,
      textBody: `URGENT: Missing Credentials for Account #${accountId}

DEADLINE: ${formattedDeadline} (3 HOURS FROM NOW)

Transaction Details:
- Account ID: #${accountId}
- Buyer: ${buyerEmail}
- Reference: ${escrowRef}

MISSING CREDENTIALS:
${missingCredentials.join(", ")}

REQUIRED ACTIONS:
1. Immediately log into the account and verify all linked services
2. Provide complete access to all missing credentials listed above
3. Update account recovery information
4. Remove any personal information
5. Contact the buyer directly to confirm credential access

WARNING: Failure to provide missing credentials within 3 hours will result in automatic escrow hold and may lead to transaction cancellation.

Contact Support: support@ghostplay.store`,
      trackOpens: true,
    });

    // Email to buyer confirming the request has been sent
    const buyerResponse = await this.sendEmail({
      to: buyerEmail,
      subject: `✅ Credential Request Sent - Account #${accountId}`,
      emailType: "support",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: white;">✅ Credential Request Sent</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We've notified the seller about the missing credentials</p>
          </div>

          <div style="padding: 20px; background: white;">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #155724;">Request Details</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Account ID:</strong> #${accountId}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Reference:</strong> ${escrowRef}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Missing Credentials:</strong></p>
              <div style="margin-left: 15px; margin-top: 10px;">
                ${missingCredentialsList}
              </div>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;"><strong>⏰ Seller has 3 hours</strong> to provide the missing credentials from now: <strong>${formattedDeadline}</strong></p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li style="margin-bottom: 5px;">The seller will be notified immediately</li>
                <li style="margin-bottom: 5px;">They have exactly 3 hours to provide missing credentials</li>
                <li style="margin-bottom: 5px;">You'll be notified once credentials are updated</li>
                <li style="margin-bottom: 5px;">If not resolved in time, the transaction will be held for review</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      textBody: `Credential Request Sent for Account #${accountId}

We've sent an urgent notification to the seller about the missing credentials you identified.

Missing Credentials: ${missingCredentials.join(", ")}
Seller Deadline: ${formattedDeadline} (3 hours)

The seller will provide the missing credentials within 3 hours or the transaction will be held for review.

Reference: ${escrowRef}`,
      trackOpens: true,
    });

    return { sellerResponse, buyerResponse };
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

  async getEmailConfig() {
    try {
      const response = await axios.get(`${this.apiUrl}/config`);
      return response.data;
    } catch (error) {
      console.error("Failed to get email config:", error);
      throw error;
    }
  }

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
