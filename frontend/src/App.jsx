import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Dashboard } from "./pages/Dashboard";
import { SendMoney } from "./pages/SendMoney";
import { Transactions } from "./pages/Transactions";
import { Profile } from "./pages/Profile";
import { Landing } from "./pages/Landing";
import { ToastProvider } from "./components/Toasts";

function App() {
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;