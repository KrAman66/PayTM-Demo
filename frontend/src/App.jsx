import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Dashboard } from "./pages/Dashboard";
import { SendMoney } from "./pages/SendMoney";
import { Transactions } from "./pages/Transactions";
import { Profile } from "./pages/Profile";
import { Landing } from "./pages/Landing";
import { RequestReset } from "./pages/RequestReset";
import { ResetPassword } from "./pages/ResetPassword";
import { ToastProvider } from "./components/Toasts";

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    // Auto-logout after 30 min of inactivity
    const TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    const checkTimeout = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity && Date.now() - parseInt(lastActivity) > TIMEOUT) {
        localStorage.clear();
        window.location.href = "/signin";
      }
    };

    // Reset timer on user activity
    window.addEventListener("click", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("mousemove", resetTimer);

    // Check every minute
    const interval = setInterval(checkTimeout, 60000);
    resetTimer(); // Set initial time

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("mousemove", resetTimer);
    };
  }, []);

  return (
    <>
      <ToastProvider />
      <button
        onClick={() => setDark(d => !d)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg text-xl"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? "☀️" : "🌙"}
      </button>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/request-reset" element={<RequestReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
