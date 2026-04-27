import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="m-4 md:m-8">
        <Balance />
        <div className="mt-4 mb-4">
          <button
            onClick={() => navigate("/transactions")}
            className="px-4 py-2 text-sm font-medium rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            View Transactions
          </button>
        </div>
        <Users />
      </div>

      {/* FAB - Send Money */}
      <button
        onClick={() => navigate("/send")}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-50"
        title="Send Money"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <span className="font-semibold">Send</span>
      </button>
    </div>
  );
};