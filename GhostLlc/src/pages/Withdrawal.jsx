import { useState } from 'react';
import NavBar from "../components/NavBar";
import { FaArrowUp, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';
import { Toaster, toast } from 'sonner';

const transactionData = [
    {
        id: 1,
        type: "Money Sent",
        status: 'Successful',
        time: '02:30 PM',
        date: 'Tuesday, April 15, 2025',
        amount: -10000,
    },
    {
        id: 2,
        type: 'Money Received',
        status: 'Successful',
        time: '10:15 AM',
        date: 'Tuesday, April 15, 2025',
        amount: 10000,
    },
    {
        id: 3,
        type: 'Withdrawn',
        status: 'Pending',
        time: '01:45 PM',
        date: 'Monday, April 14, 2025',
        amount: -5000,
    },
    {
        id: 4,
        type: 'Money Sent',
        status: 'Failed',
        time: '03:00 PM',
        date: 'Monday, April 14, 2025',
        amount: -7000,
    },
];

const Withdrawal = () => {
    const [typeFilter, setTypeFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All time');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('Email');

    const grouped = transactionData.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    const filteredData = Object.entries(grouped).map(([date, items]) => {
        const filteredItems = items.filter((item) => {
            const matchType = typeFilter === 'All' || item.type === typeFilter;
            const matchStatus = statusFilter === 'All' || item.status === statusFilter;
            return matchType && matchStatus;
        });

        return { date, transactions: filteredItems };
    }).filter(group => group.transactions.length > 0);

    return (
        <>
            <NavBar />

            <div className="p-5">
                <div className="bg-gray-700 p-7 rounded-lg mb-5">
                    <p className="text-start text-gray-300">Wallet Balance</p>
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-white text-xl">$50,000.00</h2>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full">
                            Withdraw
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
                                options: ["All", "Money Sent", "Money Received", "Withdrawn"],
                            },
                            {
                                label: "Time",
                                value: timeFilter,
                                setValue: setTimeFilter,
                                options: ["All time", "Today", "This week", "This Month", "Last 3 Months"],
                            },
                            {
                                label: "Status",
                                value: statusFilter,
                                setValue: setStatusFilter,
                                options: ["All", "Successful", "Pending", "Failed", "Reversed"],
                            },
                        ].map(({ value, setValue, options }, idx) => (
                            <select
                                key={idx}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-600 rounded-md p-2 w-full md:w-1/3"
                            >
                                {options.map((opt) => (
                                    <option key={opt} value={opt} className='text-sm'>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ))}
                    </div>

                    {/* Transactions */}
                    {filteredData.map(({ date, transactions }) => (
                        <div key={date} className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-400 mb-2">{date}</h3>
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="bg-gray-800 p-4 rounded-lg mb-3 flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl">
                                            {tx.type === "Money Sent" && (
                                                <FaArrowUp className="text-red-500" />
                                            )}
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
                                            <p
                                                className={`text-sm ${tx.status === "Successful"
                                                    ? "text-green-400"
                                                    : tx.status === "Pending"
                                                        ? "text-yellow-400"
                                                        : "text-red-400"
                                                    }`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`text-lg font-medium ${tx.amount > 0 ? "text-green-400" : "text-red-400"
                                            }`}
                                    >
                                        {tx.amount > 0 ? "+" : ""}
                                        {tx.amount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* No Transactions */}
                    {filteredData.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            <p className="text-gray-400">No transactions match your filters.</p>
                        </div>
                    )}
                </div>

                {/* Request Statement */}
                <div>
                    <Toaster richColors position="top-center" closeIcon={false} />
                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-gray-900 text-white font-medium text-center w-full py-3 rounded-lg mt-5 hover:bg-gray-800 cursor-pointer'>
                        Request Account Statement
                    </button>

                    {showModal && (
                        <div className='fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur-sm'>
                            <div className='bg-[#111827] w-full max-w-md m-5 p-6 rounded-lg shadow-lg transform transition-all duration-300 scale-100'>
                                <h2 className='text-xl font-semibold text-white mb-4'>Request Account Statement</h2>

                                {/* Date Pickers */}
                                {[
                                    { label: "From", value: dateFrom, set: setDateFrom },
                                    { label: "To", value: dateTo, set: setDateTo },
                                ].map(({ label, value, set }) => (
                                    <div key={label} className='space-y-1 mb-4'>
                                        <label className="block text-gray-400 text-sm">{label}</label>
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
                                <div className='mb-6'>
                                    <div className='text-white font-medium mb-3'>Delivery Method</div>
                                    <div className="space-y-3">
                                        {["Email", "Download PDF"].map((method) => (
                                            <label key={method} className="flex items-center gap-3 text-gray-300">
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
                                            toast.warning("Please select both 'From' and 'To' dates.");
                                            return;
                                        }
                                        setShowModal(false);
                                        toast.success("Statement requested!");
                                    }}
                                    className='bg-gray-700 text-white font-medium text-center w-full py-3 rounded-lg hover:bg-gray-800 cursor-pointer'
                                >
                                    Request Statement
                                </button>
                            </div>
                        </div>
                    )

                    }
                </div>
            </div>
        </>
    )
}

export default Withdrawal