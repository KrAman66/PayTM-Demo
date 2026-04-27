import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const id = searchParams.get("id");
  const name = searchParams.get("name");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/account/balance`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch {}
    };
    fetchBalance();
  }, []);

  if (!id || !name) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Invalid Request</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Missing user information. Please select a user from the dashboard.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const doTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        `${BACKEND_URL}/api/v1/account/transfer`,
        {
          to: id,
          amount: parseFloat(amount),
          note,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center animate-bounce">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Success!</h2>
          <p className="text-gray-600 dark:text-gray-400">₹{parseFloat(amount).toFixed(2)} sent to {name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="h-full flex flex-col justify-center">
        <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="flex justify-end mt-2 mr-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              X
            </button>
          </div>
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">Send Money</h2>
          </div>
          <div className="p-6">
            {balance !== null && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                Available: <span className="font-semibold text-gray-800 dark:text-gray-200">₹{parseFloat(balance).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl text-white">
                  {name[0].toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{name}</h3>
            </div>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
                  htmlFor="amount"
                >
                  Amount (in Rs)
                </label>
                <input
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  id="amount"
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
                  htmlFor="note"
                >
                  Note (optional)
                </label>
                <input
                  onChange={(e) => setNote(e.target.value)}
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  id="note"
                  placeholder="Add a note..."
                />
              </div>
              <button
                onClick={doTransfer}
                disabled={loading}
                className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Initiating..." : "Initiate Transfer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
