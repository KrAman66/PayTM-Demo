import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { SkeletonList } from "../components/Skeleton";

export const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all"); // all, credit, debit
  const [selectedTx, setSelectedTx] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [page, filter, startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      let url = `${BACKEND_URL}/api/v1/account/logs?page=${page}&limit=${limit}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(
        url,
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      let txs = data.transactions || [];

      // Filter locally by type
      if (filter === "credit") txs = txs.filter(t => t.isCredit);
      if (filter === "debit") txs = txs.filter(t => !t.isCredit);

      setTransactions(txs);
      setTotal(txs.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div>
      <Appbar />
      <div className="m-4 md:m-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-1 border rounded-lg border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-1 border rounded-lg border-gray-300 text-sm"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilter}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {["all", "credit", "debit"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f === "credit" ? "Credit ↑" : "Debit ↓"}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        {loading ? (
          <div className="py-8">
            <SkeletonList count={5} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {transactions.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTx(t)}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.isCredit ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {t.isCredit ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                    {t.isCredit ? `Received from ${t.from}` : `Sent to ${t.to}`}
                      {t.note && <span className="text-xs text-gray-500 ml-2">({t.note})</span>}
                  </div>
                    <div className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  t.isCredit ? "text-green-600" : "text-red-600"
                }`}>
                  {t.isCredit ? "+" : "-"}₹{t.amount}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{selectedTx._id.slice(-8)}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedTx._id); toast.success("Copied!") }}
                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className={`font-medium ${selectedTx.isCredit ? "text-green-600" : "text-red-600"}`}>
                  {selectedTx.isCredit ? "Credit" : "Debit"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className={`font-bold text-lg ${selectedTx.isCredit ? "text-green-600" : "text-red-600"}`}>
                  {selectedTx.isCredit ? "+" : "-"}₹{selectedTx.amount}
                </span>
              </div>
              {selectedTx.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Note</span>
                  <span className="font-medium">{selectedTx.note}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{selectedTx.isCredit ? "From" : "To"}</span>
                <span className="font-medium">{selectedTx.isCredit ? selectedTx.from : selectedTx.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{new Date(selectedTx.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span>{new Date(selectedTx.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit"
                })}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full mt-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
