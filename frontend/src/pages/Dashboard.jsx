import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Appbar />
      <div className="m-8">
        <Balance />
        <div className="mt-2 mb-4">
          <button
            onClick={() => navigate("/transactions")}
            className="px-4 py-2 text-sm font-medium rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            View Transactions
          </button>
        </div>
        <Users />
      </div>
    </div>
  );
};
