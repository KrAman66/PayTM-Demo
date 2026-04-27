import { BACKEND_URL } from "../config";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Balance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/account/balance`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (!res.ok) throw new Error("Failed to load balance");
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      toast.error(err.message || "Failed to load balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Available Balance</span>
        {balance === null ? (
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">Loading...</span>
        ) : (
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            ₹{balance}
          </span>
        )}
      </div>

      <button
        onClick={fetchBalance}
        disabled={loading}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Refresh balance"
      >
        <svg
          className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};