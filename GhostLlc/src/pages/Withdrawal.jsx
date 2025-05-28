import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import NavBar from "../components/NavBar";
import { FaArrowDown, FaMoneyBillWave, FaSpinner } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { useEscrowTotal } from "../hooks/useEscrowTotals";
import { EscrowService } from "../services/Escrow.service";
import { db } from "../database/firebaseConfig";
import { useAuth } from "../components/AuthContext";
import BankDetailsModal from "../components/BankDetailsModal";

const Withdrawal = () => {
  const { currentUser } = useAuth();
  const [typeFilter, setTypeFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All time");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Email");
  const [withdrawing, setWithdrawing] = useState(false);

  // Escrow data and withdrawal totals
  const { totalAmount, loading, withdrawalRequests } =
    useEscrowTotal("buyer_confirmed");

  // All escrow transactions for history
  const [allEscrows, setAllEscrows] = useState([]);
  const [escrowsLoading, setEscrowsLoading] = useState(true);

  const [showBankModal, setShowBankModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all escrow transactions for the current user
  useEffect(() => {
    if (!currentUser?.uid) {
      setAllEscrows([]);
      setEscrowsLoading(false);
      return;
    }

    setEscrowsLoading(true);
    const escrowsCol = collection(db, "escrows");
    const q = query(
      escrowsCol,
      where("sellerId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const escrows = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(data);

          return {
            id: doc.id,
            ...data,
            amount:
              typeof data.amount === "number"
                ? data.amount
                : parseFloat(data.amount) || 0,
          };
        });
        setAllEscrows(escrows);
        setEscrowsLoading(false);
      },
      (error) => {
        console.error("Error fetching escrows:", error);
        setAllEscrows([]);
        setEscrowsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Transform escrow data into transaction format
  const getTransactionType = (escrow) => {
    if (escrow.status === "released" || escrow.sellerWithdrawn) {
      return "Withdrawn";
    }
    return "Money Received";
  };

  const getTransactionStatus = (escrow) => {
    switch (escrow.status) {
      case "pending_verification":
        return "Pending";
      case "awaiting_feedback":
        return "Pending";
      case "buyer_confirmed":
        return "Successful";
      case "holding":
        return "Pending";
      case "disputed":
        return "Failed";
      case "released":
        return "Successful";
      case "refunded":
        return "Failed";
      default:
        return "Pending";
    }
  };

  // Fixed formatDate function to handle Firebase timestamps
  const formatDate = (timestamp) => {
    let date;

    // Handle Firebase timestamp format
    if (timestamp && typeof timestamp === "object" && timestamp.seconds) {
      // Convert Firebase timestamp to JavaScript Date
      date = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      );
    } else if (timestamp) {
      // Handle regular timestamp
      date = new Date(timestamp);
    } else {
      // Fallback to current date if timestamp is invalid
      date = new Date();
    }

    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Convert escrows to transaction format
  const transactionData = allEscrows.map((escrow) => {
    const { date, time } = formatDate(escrow.createdAt);
    const type = getTransactionType(escrow);
    const isWithdrawn = escrow.status === "released" || escrow.sellerWithdrawn;

    return {
      id: escrow.id,
      type,
      status: getTransactionStatus(escrow),
      time,
      date,
      amount: isWithdrawn ? -escrow.amount : escrow.amount,
      itemDescription: escrow.itemDescription,
      escrowStatus: escrow.status,
      createdAt: escrow.createdAt, // Keep original timestamp for filtering
    };
  });

  // Filter transactions
  const filterTransactionsByTime = (transactions) => {
    if (timeFilter === "All time") return transactions;

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case "Today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "This week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "This Month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "Last 3 Months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return transactions;
    }

    return transactions.filter((tx) => {
      let txDate;

      // Handle Firebase timestamp for filtering
      if (
        tx.createdAt &&
        typeof tx.createdAt === "object" &&
        tx.createdAt.seconds
      ) {
        txDate = new Date(tx.createdAt.seconds * 1000);
      } else {
        txDate = new Date(tx.createdAt);
      }

      return txDate >= filterDate;
    });
  };

  const filteredTransactions = filterTransactionsByTime(transactionData).filter(
    (item) => {
      const matchType = typeFilter === "All" || item.type === typeFilter;
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;
      return matchType && matchStatus;
    }
  );

  // Group by date
  const grouped = filteredTransactions.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const filteredData = Object.entries(grouped)
    .map(([date, items]) => ({ date, transactions: items }))
    .filter((group) => group.transactions.length > 0);

  const handleWithdrawAll = async () => {
    if (withdrawalRequests.length === 0) {
      toast.error("No funds available for withdrawal");
      return;
    }

    setWithdrawing(true);
    setErrorMsg("");

    const service = new EscrowService(db);
    try {
      await service.ensureBankDetailsOnUser(withdrawalRequests[0].sellerId);

      // Process all withdrawals
      const results = await Promise.all(
        withdrawalRequests.map((req) => service.processWithdrawal(req))
      );

      console.log("Processed withdrawals:", results);
      toast.success(`Successfully processed ${results.length} withdrawal(s)`);
    } catch (err) {
      if (err.code === "NO_BANK_DETAILS") {
        setShowBankModal(true);
      } else {
        const errorMessage = err.message || "Withdrawal failed";
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <NavBar />

      {/* Loading Overlay during withdrawal */}
      {withdrawing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
            <FaSpinner className="animate-spin text-white text-xl" />
            <span className="text-white font-medium">
              Processing withdrawal...
            </span>
          </div>
        </div>
      )}

      {showBankModal && (
        <BankDetailsModal
          onClose={() => setShowBankModal(false)}
          onSuccess={() => {
            setShowBankModal(false);
          }}
          userId={withdrawalRequests[0]?.sellerId}
        />
      )}

      {errorMsg && <p className="mt-2 text-red-400 text-center">{errorMsg}</p>}

      <div className="p-5">
        <div className="bg-gray-700 p-7 rounded-lg mb-5">
          <p className="text-start text-gray-300">Withdrawable Balance</p>
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white text-xl">
              ₦{loading ? "loading..." : totalAmount.toFixed(2)}
            </h2>
            <button
              onClick={handleWithdrawAll}
              disabled={withdrawing || loading || totalAmount === 0}
              className={`font-medium py-2 px-4 rounded-full ${
                withdrawing || loading || totalAmount === 0
                  ? "bg-gray-500 cursor-not-allowed text-gray-300"
                  : "bg-green-500 hover:bg-green-700 text-white"
              }`}
            >
              {withdrawing ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Withdrawing...
                </div>
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
        </div>

        <div className="text-white">
          {/* Dropdown Filters */}
          <div className="flex flex-row gap-4 mb-6">
            {[
              {
                label: "Type",
                value: typeFilter,
                setValue: setTypeFilter,
                options: ["All", "Money Received", "Withdrawn"],
              },
              {
                label: "Time",
                value: timeFilter,
                setValue: setTimeFilter,
                options: [
                  "All time",
                  "Today",
                  "This week",
                  "This Month",
                  "Last 3 Months",
                ],
              },
              {
                label: "Status",
                value: statusFilter,
                setValue: setStatusFilter,
                options: ["All", "Successful", "Pending", "Failed"],
              },
            ].map(({ label, value, setValue, options }, idx) => (
              <div key={idx} className="w-full md:w-1/3">
                <label className="block text-gray-400 text-sm mb-1">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-600 rounded-md p-2 w-full"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt} className="text-sm">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Loading state for transactions */}
          {escrowsLoading ? (
            <div className="text-center text-gray-400 mt-10">
              <FaSpinner className="animate-spin mx-auto mb-4 text-2xl" />
              <p>Loading transactions...</p>
            </div>
          ) : (
            <>
              {/* Transactions */}
              {filteredData.map(({ date, transactions }) => (
                <div key={date} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    {date}
                  </h3>
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-gray-800 p-4 rounded-lg mb-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xl">
                          {tx.type === "Money Received" && (
                            <FaArrowDown className="text-green-500" />
                          )}
                          {tx.type === "Withdrawn" && (
                            <FaMoneyBillWave className="text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-gray-400">{tx.time}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {tx.itemDescription}
                          </p>
                          <p
                            className={`text-sm ${
                              tx.status === "Successful"
                                ? "text-green-400"
                                : tx.status === "Pending"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {tx.status}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`text-lg font-medium ${
                          tx.amount > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}₦
                        {Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* No Transactions */}
              {filteredData.length === 0 && !escrowsLoading && (
                <div className="text-center text-gray-400 mt-10">
                  <p className="text-gray-400">
                    No transactions match your filters.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Request Statement */}
        <div>
          <Toaster richColors position="top-center" closeIcon={false} />
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white font-medium text-center w-full py-3 rounded-lg mt-5 hover:bg-gray-800 cursor-pointer"
          >
            Request Account Statement
          </button>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
              <div className="bg-[#111827] w-full max-w-md m-5 p-6 rounded-lg shadow-lg transform transition-all duration-300 scale-100">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Request Account Statement
                </h2>

                {/* Date Pickers */}
                {[
                  { label: "From", value: dateFrom, set: setDateFrom },
                  { label: "To", value: dateTo, set: setDateTo },
                ].map(({ label, value, set }) => (
                  <div key={label} className="space-y-1 mb-4">
                    <label className="block text-gray-400 text-sm">
                      {label}
                    </label>
                    <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
                      <input
                        type="date"
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="bg-transparent outline-none text-white w-full"
                      />
                    </div>
                  </div>
                ))}

                <hr className="border-gray-700 my-4" />

                {/* Delivery Method */}
                <div className="mb-6">
                  <div className="text-white font-medium mb-3">
                    Delivery Method
                  </div>
                  <div className="space-y-3">
                    {["Email", "Download PDF"].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={method}
                          checked={deliveryMethod === method}
                          onChange={() => setDeliveryMethod(method)}
                          className="accent-[#4426B9]"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (!dateFrom || !dateTo) {
                      toast.warning(
                        "Please select both 'From' and 'To' dates."
                      );
                      return;
                    }
                    setShowModal(false);
                    toast.success("Statement requested!");
                  }}
                  className="bg-gray-700 text-white font-medium text-center w-full py-3 rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                  Request Statement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Withdrawal;
