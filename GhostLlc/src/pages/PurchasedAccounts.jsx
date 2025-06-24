import { useState } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { FaFacebook, FaExclamationCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsApple } from "react-icons/bs";
import { BiLinkAlt } from "react-icons/bi";
import { TbCircleX } from "react-icons/tb";
import { EscrowService } from "../services/Escrow.service";
import emailService from "../services/api/Email.service"; // Import your email service
import { db } from "../database/firebaseConfig";
import { useUser } from "../hooks/useUser";

const PurchasedAccountsDetails = () => {
  const { account, currentUser } = useOutletContext();
  const { user } = useUser(account?.userId);
  const navigate = useNavigate();
  const { reference, slug } = useParams();

  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    icloud: false,
    google: false,
    accountNotFound: false,
    noAdditionalAccounts: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckboxChange = (account) => {
    setLinkedAccounts((prev) => ({
      ...prev,
      [account]: !prev[account],
      noAdditionalAccounts:
        account === "noAdditionalAccounts"
          ? !prev.noAdditionalAccounts
          : account !== "noAdditionalAccounts" && prev.noAdditionalAccounts
          ? false
          : prev.noAdditionalAccounts,
    }));
  };

  const handleContinue = async () => {
    setIsProcessing(true);

    try {
      const service = new EscrowService(db);

      if (linkedAccounts.noAdditionalAccounts) {
        // If no additional accounts, confirm the purchase directly
        await service.confirmByBuyer(
          reference,
          currentUser?.email,
          user?.email
        );
        navigate(`/account/${account.id}`);
      } else {
        // Identify missing credentials
        const missingCredentials = [];

        if (linkedAccounts.facebook) missingCredentials.push("facebook");
        if (linkedAccounts.icloud) missingCredentials.push("icloud");
        if (linkedAccounts.google) missingCredentials.push("google");
        if (linkedAccounts.accountNotFound)
          missingCredentials.push("accountNotFound");

        // Send specific credential request email
        try {
          await emailService.sendSpecificCredentialRequestEmail(
            reference,
            currentUser?.email,
            user?.email,
            account.id,
            missingCredentials,
            {
              description: account.description || account.title || slug,
              price: account.price,
              currency: account.currency || "NGN",
            }
          );

          console.log("Credential request emails sent successfully");
        } catch (emailError) {
          console.error(
            "Failed to send credential request emails:",
            emailError
          );
          // Continue with the transaction hold even if email fails
        }

        // Generate a detailed reason based on the specific verification issues
        const credentialNames = {
          facebook: "Facebook",
          icloud: "iCloud/Apple ID",
          google: "Google Account",
          accountNotFound: "Account Access Issues",
        };

        const missingCredentialNames = missingCredentials.map(
          (cred) => credentialNames[cred] || cred
        );

        const specificReason = `URGENT: Missing linked account credentials identified by buyer. Missing: ${missingCredentialNames.join(
          ", "
        )}. Seller has been notified and has 3 hours to provide complete access to all missing credentials. Transaction held pending credential verification.`;

        // Mark the transaction as holding with specific reason
        await service.markHolding(
          reference,
          specificReason,
          currentUser?.email,
          user?.email
        );

        // Show success message to user
        alert(
          `Credential request sent! The seller has been notified about the missing ${missingCredentialNames.join(
            ", "
          )} credentials and has 3 hours to provide them.`
        );

        navigate(`/account/${account.id}`);
      }
    } catch (error) {
      console.error("Error processing purchase verification:", error);
      alert(
        "An error occurred while processing your request. Please try again or contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="text-gray-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Accounts Linked: {slug}
        </h2>

        <div className="bg-[#121418] border-l-4 border-orange-500 p-4 rounded mb-6">
          <div className="flex items-start">
            <FaExclamationCircle className="text-orange-500 text-xl mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-orange-500">Alert!</h3>
              <p className="text-orange-400 mt-2">
                Your account is still in a state of risk. It is not safe yet to
                own this account as the seller might still have access to it.
              </p>
              <p className="text-orange-400 mt-2">
                Please log into this account and check for other possible
                accounts linked to this. Click the checkbox for linked ones.
              </p>
              <p className="text-orange-300 mt-3 font-semibold">
                ⏰ If any credentials are missing, the seller will be given
                exactly 3 hours to provide them.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Facebook */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <FaFacebook className="text-[#1877F2] text-2xl mr-3" />
              <span>Facebook</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={linkedAccounts.facebook}
                onChange={() => handleCheckboxChange("facebook")}
                className="w-5 h-5"
                disabled={isProcessing}
              />
              {linkedAccounts.facebook && (
                <span className="ml-2 text-red-400 text-sm">Missing</span>
              )}
            </div>
          </div>

          {/* iCloud */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <BsApple className="text-white text-2xl mr-3" />
              <span>iCloud</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={linkedAccounts.icloud}
                onChange={() => handleCheckboxChange("icloud")}
                className="w-5 h-5"
                disabled={isProcessing}
              />
              {linkedAccounts.icloud && (
                <span className="ml-2 text-red-400 text-sm">Missing</span>
              )}
            </div>
          </div>

          {/* Google */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <FcGoogle className="text-2xl mr-3" />
              <span>Google</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={linkedAccounts.google}
                onChange={() => handleCheckboxChange("google")}
                className="w-5 h-5"
                disabled={isProcessing}
              />
              {linkedAccounts.google && (
                <span className="ml-2 text-red-400 text-sm">Missing</span>
              )}
            </div>
          </div>

          {/* Account Not Found */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <TbCircleX className="text-gray-300 text-2xl mr-3" />
              <span>Account Not Found</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={linkedAccounts.accountNotFound}
                onChange={() => handleCheckboxChange("accountNotFound")}
                className="w-5 h-5"
                disabled={isProcessing}
              />
              {linkedAccounts.accountNotFound && (
                <span className="ml-2 text-red-400 text-sm">Issue Found</span>
              )}
            </div>
          </div>

          {/* No Additional Accounts Linked */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <BiLinkAlt className="text-gray-300 text-2xl mr-3" />
              <span>No additional accounts linked</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={linkedAccounts.noAdditionalAccounts}
                onChange={() => handleCheckboxChange("noAdditionalAccounts")}
                className="w-5 h-5"
                disabled={isProcessing}
              />
              {linkedAccounts.noAdditionalAccounts && (
                <span className="ml-2 text-green-400 text-sm">✓ Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Display selected missing credentials */}
        {!linkedAccounts.noAdditionalAccounts && (
          <div className="mt-6 bg-red-900/20 border border-red-500/30 p-4 rounded">
            <h4 className="text-red-400 font-semibold mb-2">
              ⚠️ Missing Credentials Detected:
            </h4>
            <ul className="text-red-300 text-sm">
              {linkedAccounts.facebook && <li>• Facebook account access</li>}
              {linkedAccounts.icloud && <li>• iCloud/Apple ID credentials</li>}
              {linkedAccounts.google && <li>• Google account access</li>}
              {linkedAccounts.accountNotFound && (
                <li>• Account access issues found</li>
              )}
            </ul>
            <p className="mt-3 text-orange-300 text-sm">
              The seller will be immediately notified and given 3 hours to
              provide these credentials.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className={`px-6 py-2 rounded text-lg font-medium transition-all duration-200 ${
            isProcessing
              ? "bg-gray-600 cursor-not-allowed text-gray-300"
              : "bg-purple-700 hover:bg-purple-800 text-white"
          }`}
        >
          {isProcessing ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default PurchasedAccountsDetails;
