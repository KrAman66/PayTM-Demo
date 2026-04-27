import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";

const schema = {
  token: (v) => (!v ? "Reset token is required" : null),
  newPassword: (v) => {
    if (!v || v.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(v)) return "Must contain a lowercase letter";
    if (!/[A-Z]/.test(v)) return "Must contain an uppercase letter";
    if (!/[0-9]/.test(v)) return "Must contain a number";
    if (!/[^A-Za-z0-9]/.test(v)) return "Must contain a special character";
    return null;
  },
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    const errToken = schema.token(token);
    const errPass = schema.newPassword(newPassword);
    if (errToken || errPass) {
      toast.error(errToken || errPass);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Reset failed");
      }
      toast.success("Password reset successfully! Please sign in.");
      navigate("/signin");
    } catch (err) {
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-300 dark:bg-gray-900 min-h-screen flex justify-center p-4">
      <div className="flex flex-col justify-center w-full max-w-sm">
        <div className="rounded-lg bg-white dark:bg-gray-800 w-full text-center p-2 h-max px-4">
          <div className="font-bold text-4xl pt-6 text-gray-800 dark:text-gray-200">Reset Password</div>
          <div className="text-slate-500 dark:text-gray-400 text-md pt-1 px-4 pb-4">
            Enter your new password
          </div>
          <form onSubmit={handleReset}>
            <input
              type="text"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-2 py-1 border rounded border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-2 py-1 border rounded border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          <div className="py-2 text-sm flex justify-center">
            <div className="text-gray-600 dark:text-gray-400">
              Remember your password?
            </div>
            <div className="pl-1">
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
