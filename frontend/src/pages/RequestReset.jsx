import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";

const schema = {
  username: (v) => (!v || !v.includes("@")) ? "Invalid email" : null,
};

export const RequestReset = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = schema.username(username);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/request-password-reset`, {
        username,
      });
      setSubmitted(true);
      if (res.data.resetToken) {
        // For testing only - in production, token is sent via email
        toast.success(`Reset token: ${res.data.resetToken}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-slate-300 dark:bg-gray-900 min-h-screen flex justify-center p-4">
        <div className="flex flex-col justify-center w-full max-w-sm">
          <div className="rounded-lg bg-white dark:bg-gray-800 w-full text-center p-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Check your email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If {username} exists, a reset link has been sent.
            </p>
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-600 hover:underline text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-300 dark:bg-gray-900 min-h-screen flex justify-center p-4">
      <div className="flex flex-col justify-center w-full max-w-sm">
        <div className="rounded-lg bg-white dark:bg-gray-800 w-full text-center p-2 h-max px-4">
          <div className="font-bold text-4xl pt-6 text-gray-800 dark:text-gray-200">Reset Password</div>
          <div className="text-slate-500 dark:text-gray-400 text-md pt-1 px-4 pb-4">
            Enter your email to receive a reset link
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <div className="py-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remember your password? </span>
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
