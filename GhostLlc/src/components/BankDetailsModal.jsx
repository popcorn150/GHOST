import { useMemo, useState } from "react";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../database/firebaseConfig";
import withdrawalService from "../services/api/Withdrawal.service";
import SearchableBankSelect from "./SearchableInput";
import BankData from "../data/bankAccounts.json";

// eslint-disable-next-line react/prop-types
export default function BankDetailsModal({ onClose, onSuccess, userId }) {
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const banks = useMemo(() => {
    return BankData?.data?.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      // write to your users collection
      //   await setDoc(
      //     doc(db, "users", userId),
      //     {
      //       fullName,
      //       bankAccountNumber: accountNumber,
      //       bankCode,
      //       paystackRecipientCode: "",
      //     },
      //     { merge: true }
      //   );
      const response = await withdrawalService.setBankDetails({
        fullName,
        bankAccountNumber: accountNumber,
        bankCode,
        userId,
      });
      console.log({ response });

      onSuccess();
    } catch (e) {
      console.error(e);
      setErr("Failed to save bank details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">Add Your Bank Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Full Name</label>
            <input
              className="w-full px-3 py-2 bg-gray-800 rounded focus:outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Account Number</label>
            <input
              className="w-full px-3 py-2 bg-gray-800 rounded focus:outline-none"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <SearchableBankSelect
            banks={banks}
            value={bankCode}
            onChange={setBankCode}
          />
          {err && <p className="text-red-400">{err}</p>}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
