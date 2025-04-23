import React, { useState, useEffect } from "react";
import NavBar from "./Profile/NavBar";
import BackButton from "../components/BackButton";
import { auth, db } from "../database/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const PrivacyPolicy = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().profileImage) {
            setProfileImage(userDocSnap.data().profileImage);
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
      setIsLoading(false);
    };

    fetchProfileImage();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#010409]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0576FF]"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar profileImage={profileImage || "/default-profile.png"} />

      <div className="mx-5">
        <BackButton className="my-5" />

        <div className="mx-auto mt-10 grid justify-center items-center">
          <h2 className="text-white font-semibold text-xl">
            Privacy Policy for Ghost
          </h2>
          <h5 className="text-white text-center mt-3">
            Effective Date: 3/29/2025
          </h5>
        </div>

        <div className="py-5 border-b-5 border-gray-700 mt-5">
          <h3 className="text-white text-start text-lg/7">
            Welcome to Ghost! Your privacy and security are important to us.
            This Privacy Policy explains how we collect, use, and protect your
            information when using our platform.
          </h3>
        </div>

        <ol className="list-decimal list-inside mt-5 mb-5 text-start text-gray-400">
          {/* Sections Begin */}
          {[
            {
              title: "Information We Collect",
              content: [
                "We collect the following types of information:",
                {
                  type: "list",
                  items: [
                    "<b>Personal Information:</b> Name, email, payment details (only for transactions), and bank account details for withdrawals.",
                    "<b>Account Data:</b> Game accounts listed for sale, transaction history, and account preferences.",
                    "<b>Usage Data:</b> IP address, device information, and app activity for security and analytics.",
                  ],
                },
              ],
            },
            {
              title: "How We Use Your Information",
              content: [
                "We use your data to:",
                {
                  type: "list",
                  items: [
                    "Facilitate buying and selling of gaming accounts securely.",
                    "Process payments and withdrawals through <b>Stripe</b>, <b>PayPal</b>, and <b>Wise</b>.",
                    "Improve our services and prevent fraud.",
                    "Communicate updates and important notifications.",
                  ],
                },
              ],
            },
            {
              title: "Payment & Escrow System",
              content: [
                {
                  type: "list",
                  items: [
                    "<b>Buyer Protection:</b> Payment is held in escrow for <b>24 hours</b>.",
                    "If the seller doesn't respond within <b>24 hours</b>, the buyer will be refunded and seller may receive a warning.",
                    "Once the buyer confirms account ownership, funds are released to the seller.",
                    "Disputes are handled by Ghost based on proof of account transfer.",
                  ],
                },
              ],
            },
            {
              title: "Withdrawals",
              content: [
                {
                  type: "list",
                  items: [
                    "Withdraw via <b>bank transfers (GTB, Zenith, Stanbic for Africa)</b> or <b>PayPal/Wise</b> for international users.",
                    "Withdrawals are processed within 2–5 business days.",
                    "Ensure your payment details are accurate. Ghost is not liable for failed withdrawals.",
                  ],
                },
              ],
            },
            {
              title: "User Security & Verification",
              content: [
                {
                  type: "list",
                  items: [
                    "We require login authentication but not ID verification for withdrawals (currently).",
                    "Users are responsible for account and transaction security.",
                    "Fraudulent activity may lead to investigation or suspension.",
                  ],
                },
              ],
            },
            {
              title: "Data Security & Storage",
              content: [
                {
                  type: "list",
                  items: [
                    "We use <b>encryption</b> and <b>secure gateways</b> to protect financial data.",
                    "We don’t store full card details.",
                    "Your data is secure and not shared without consent.",
                  ],
                },
              ],
            },
            {
              title: "User Responsibilities",
              content: [
                {
                  type: "list",
                  items: [
                    "<b>Buyers</b> must change all credentials after purchase.",
                    "<b>Sellers</b> must also ensure the buyer gets full access.",
                    "Failure to comply may result in <b>suspension or permanent ban</b>.",
                  ],
                },
              ],
            },
            {
              title: "Future Crypto Integration",
              content: [
                {
                  type: "list",
                  items: [
                    "We plan to introduce <b>crypto payments</b> and <b>withdrawals</b> in the future.",
                    "Details will be shared upon release.",
                  ],
                },
              ],
            },
            {
              title: "Changes to this Privacy Policy",
              content: [
                "Ghost reserves the right to update this policy at any time.",
                "Users will be notified of major changes via email or in-app.",
                "For concerns, please contact [Insert Support Email].",
              ],
            },
          ].map((section, index) => (
            <div key={index} className="mb-10">
              <li className="text-white text-lg font-semibold">
                {section.title}
              </li>
              {section.content.map((entry, idx) =>
                typeof entry === "string" ? (
                  <h4
                    key={idx}
                    className="text-white text-sm px-5 py-3"
                    dangerouslySetInnerHTML={{ __html: entry }}
                  />
                ) : (
                  <ul
                    key={idx}
                    className="list-disc px-7 py-3 text-start text-gray-400"
                  >
                    {entry.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-white text-sm mb-3"
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    ))}
                  </ul>
                )
              )}
            </div>
          ))}
        </ol>

        <div className="py-5 px-7">
          <h4 className="text-white text-sm text-center font-medium">
            <b>Ghost - Secure Gaming Account Marketplace.</b>
          </h4>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
