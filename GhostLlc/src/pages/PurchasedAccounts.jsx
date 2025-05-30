import { useState } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { FaFacebook, FaExclamationCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsApple } from "react-icons/bs";
import { BiLinkAlt } from "react-icons/bi";
import { TbCircleX } from "react-icons/tb";
import { EscrowService } from "../services/Escrow.service";
import { db } from "../database/firebaseConfig";
import { useUser } from "../hooks/useUser";

const PurchasedAccountsDetails = () => {
  const { account, currentUser } = useOutletContext();
  const { user } = useUser(account?.userId);
  const navigate = useNavigate();
  const { reference, slug } = useParams();
  // console.log({ account, currentUser, error, user });

  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    icloud: false,
    google: false,
    accountNotFound: false,
    noAdditionalAccounts: true,
  });

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

  const handleContinue = () => {
    // Handle continue logic here
    const service = new EscrowService(db);

    if (linkedAccounts.noAdditionalAccounts) {
      // If no additional accounts, confirm the purchase directly
      service
        .confirmByBuyer(reference, currentUser?.email, user?.email)
        .then(() => {
          // After confirmation is successful, navigate to the account page
          navigate(`/account/${account.id}`);
        })
        .catch((error) => {
          console.error("Error confirming purchase:", error);
          // Handle error case here
        });
    } else {
      // If there are additional accounts needed, mark as holding
      // Generate a detailed reason based on the specific verification issues
      let verificationIssues = [];

      if (account.missingDocuments) {
        verificationIssues.push(
          `Missing required documents: ${account.missingDocuments.join(", ")}`
        );
      }

      if (account.pendingVerifications) {
        verificationIssues.push(
          `Pending verifications: ${account.pendingVerifications.join(", ")}`
        );
      }

      if (
        linkedAccounts.incompleteAccounts &&
        linkedAccounts.incompleteAccounts.length > 0
      ) {
        const incompleteAccountsList = linkedAccounts.incompleteAccounts
          .map((acc) => acc.name || acc.id)
          .join(", ");
        verificationIssues.push(
          `Incomplete linked accounts: ${incompleteAccountsList}`
        );
      }

      // Default message if no specific issues are identified
      const specificReason =
        verificationIssues.length > 0
          ? `Transaction on hold pending: ${verificationIssues.join(
              "; "
            )}. Please address these issues to complete the transaction.`
          : "Additional account verification required before confirmation. Please complete all verification steps.";

      service
        .markHolding(reference, specificReason, currentUser?.email, user?.email)
        .then(() => {
          // After marking as holding, navigate to the account page
          navigate(`/account/${account.id}`);
        })
        .catch((error) => {
          console.error("Error marking as holding:", error);
          // Handle error case here
        });
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
            <input
              type="checkbox"
              checked={linkedAccounts.facebook}
              onChange={() => handleCheckboxChange("facebook")}
              className="w-5 h-5"
            />
          </div>

          {/* iCloud */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <BsApple className="text-white text-2xl mr-3" />
              <span>iCloud</span>
            </div>
            <input
              type="checkbox"
              checked={linkedAccounts.icloud}
              onChange={() => handleCheckboxChange("icloud")}
              className="w-5 h-5"
            />
          </div>

          {/* Google */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <FcGoogle className="text-2xl mr-3" />
              <span>Google</span>
            </div>
            <input
              type="checkbox"
              checked={linkedAccounts.google}
              onChange={() => handleCheckboxChange("google")}
              className="w-5 h-5"
            />
          </div>

          {/* Account Not Found */}
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded">
            <div className="flex items-center">
              <TbCircleX className="text-gray-300 text-2xl mr-3" />
              <span>Account Not Found</span>
            </div>
            <input
              type="checkbox"
              checked={linkedAccounts.accountNotFound}
              onChange={() => handleCheckboxChange("accountNotFound")}
              className="w-5 h-5"
            />
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
                className="w-5 h-5 mr-2"
              />
              {/* <FaCheck className="text-green-500 text-xl" /> */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded text-lg font-medium transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PurchasedAccountsDetails;
