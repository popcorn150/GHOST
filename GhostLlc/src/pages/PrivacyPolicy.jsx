import NavBar from "./Profile/NavBar"
import BackButton from "../components/BackButton"
const PrivacyPolicy = () => {
    return (
        <>
            <NavBar />

            <div className="mx-auto mt-10 grid justify-center items-center">
                <h2 className="text-white font-semibold text-xl">Privacy Policy for Ghost</h2>
                <h5 className="text-white text-center mt-3">Effective Date: 3/29/2025</h5>
            </div>

            <div className="mx-5">
                <BackButton className="my-5" />
                <div className="py-5 border-b-5 border-gray-700">
                    <h3 className="text-white text-start text-lg/7">Welcome to Ghost! Your privacy and security are important to us.
                        This Privacy Policy explains how we collect, use, and protect your information when using our platform.
                    </h3>
                </div>

                <ol className="list-decimal list-inside mt-5 mb-5 text-start text-gray-400">
                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">Information We Collect</li>
                        <h4 className="text-white text-sm px-5 py-3">We collect the following types of information:</h4>
                        <ul className="list-disc px-7 text-start text-gray-400">
                            <li className="text-white text-sm mb-3"><span className="font-semibold">Personal Information:</span> Name, email, payment details (only for transactions), and bank account details for withdrawals.</li>
                            <li className="text-white text-sm mb-3"><span className="font-semibold">Account Data:</span> Game accounts listed for sale, transaction history, and account preferences.</li>
                            <li className="text-white text-sm"><span className="font-semibold">Usage Data:</span> IP address, device information, and app activity for security and analytics.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">How We Use Your Information</li>
                        <h4 className="text-white text-sm px-5 py-3">We use your data to:</h4>
                        <ul className="list-disc px-7 text-start text-gray-400">
                            <li className="text-white text-sm mb-3">Facilitate buying and selling of gaming accounts securely.</li>
                            <li className="text-white text-sm mb-3">Process payments and withdrawals through <b>Stripe</b>, <b>PayPal</b>, and <b>Wise</b>.</li>
                            <li className="text-white text-sm mb-3">Improve our services and prevent fraud.</li>
                            <li className="text-white text-sm">Communicate updates and important notifications.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">Payment & Escrow System</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3"><b>Buyer Protection:</b> When a buyer purchases a gaming account, their payment is held in escrow for <b>24 hours</b>.</li>
                            <li className="text-white text-sm mb-3">If the seller does not respond within <b>24 hours</b>, the buyer will be refunded, and the seller may receive a warning.</li>
                            <li className="text-white text-sm mb-3">Once the buyer confirms account ownership, funds are released to the seller’s connected bank or payment provider.</li>
                            <li className="text-white text-sm">In case of disputes, Ghost will mediate based on provided proof of account transfer.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">Withdrawals</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3">Users can withdraw funds via <b>bank transfers (GTB, Zenith, Stanbic for Africa) and PayPal/Wise for international users</b>.</li>
                            <li className="text-white text-sm mb-3">Withdrawals are processed within 2-5 business days, depending on the payment provider.</li>
                            <li className="text-white text-sm mb-3">Users must ensure that their payment details are correct. Ghost is not responsible for failed withdrawals due to incorrect details.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">User Security & Verification</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3">While Ghost requires login authentication, we do not currently enforce ID verification for withdrawals.</li>
                            <li className="text-white text-sm mb-3">Users are responsible for securing their accounts and transaction details.</li>
                            <li className="text-white text-sm mb-3">If fraudulent activity is detected, Ghost reserves the right to investigate and suspend accounts.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">Data Security & Storage</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3">We use <b>encryption</b> and <b>secure payment gateways</b> to protect your financial data.</li>
                            <li className="text-white text-sm mb-3">Ghost does not store sensitive payment information such as full card details.</li>
                            <li className="text-white text-sm mb-3">Your data is stored securely and will not be shared with third parties without consent.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">User Responsibilities</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3"><b>Buyers</b> must ensure that they change all account credentials upon purchase.</li>
                            <li className="text-white text-sm mb-3"><b>Sellers</b> must ensure that they change all account credentials upon purchase.</li>
                            <li className="text-white text-sm mb-3">Failure to comply with platform policies may result in <b>account suspension</b> or <b>permanent ban</b>.</li>
                        </ul>
                    </div>

                    <div className="mb-10">
                        <li className="text-white text-lg font-semibold">Future Crypto Integration</li>
                        <ul className="list-disc px-7 py-3 text-start text-gray-400">
                            <li className="text-white text-sm mb-3">We plan to introduce <b>crypto payments</b> and <b>withdrawals</b> in the future.</li>
                            <li className="text-white text-sm mb-3">Further details will be provided once this feature is implemented.</li>
                        </ul>
                    </div>

                    <div className="mb-5 border-b-2 border-gray-700">
                        <li className="text-white text-lg font-semibold">Changes to this Privacy Policy</li>
                        <ul className="mb-3 list-disc px-7 py-3 text-start text-gray-400">
                            <h4 className="text-white text-sm mb-2">Ghost reserves the right to update this policy at any time. Users will be notified of significant changes via email or in-app notifications.</h4>
                            <h4 className="text-white text-sm">For any concerns or questions, please contact [Insert Support Email].</h4>
                        </ul>
                    </div>

                    <div className="py-5 px-2">
                        <h4 className="text-white text-xs font-medium md:text-sm text-center"><b>Ghost - Secure Gaming Account Marketplace.</b></h4>
                    </div>
                </ol>
            </div>
        </>
    )
}

export default PrivacyPolicy