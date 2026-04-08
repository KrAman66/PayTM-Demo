import { BACKEND_URL } from "../config";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Balance = () => {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/account/balance`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          },
        );
        setBalance(response.data.balance);
      } catch {
        toast.error("Failed to load balance");
      }
    };
    fetchBalance();
  }, []);

  if (balance === null) {
    return (
      <div className="flex">
        <div className="font-bold text-lg">Your balance</div>
        <div className="font-semibold ml-4 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="font-bold text-lg">Your balance</div>
      <div className="font-semibold ml-4 text-lg">Rs {balance}</div>
    </div>
  );
};
