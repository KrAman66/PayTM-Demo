import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";

const token = localStorage.getItem("token");

export const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/account/logs?page=${page}&limit=${limit}`,
        { headers: { Authorization: "Bearer " + token } },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Appbar />
      <div className="m-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Description</th>
                  <th className="text-right px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td className="px-3 py-2 text-gray-600">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {t.isCredit ? (
                        <span className="text-green-600 font-medium">
                          Credit from {t.from}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Debit to {t.to}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        t.isCredit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.isCredit ? "+" : "-"}Rs {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <span className="px-3 py-1 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
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
    </div>
  );
};
