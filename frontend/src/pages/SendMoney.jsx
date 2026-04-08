import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const id = searchParams.get("id");
  const name = searchParams.get("name");

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
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      toast.success("Transaction successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center h-screen bg-gray-100">
      <div className="h-full flex flex-col justify-center">
        <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
          <div className="flex justify-end mt-2 mr-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
            >
              X
            </button>
          </div>
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-3xl font-bold text-center">Send Money</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl text-white">
                  {name[0].toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-semibold">{name}</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="amount"
                >
                  Amount (in Rs)
                </label>
                <input
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="amount"
                  placeholder="Enter amount"
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
