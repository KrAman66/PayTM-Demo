import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <nav className="flex justify-between items-center px-6 md:px-12 py-4">
        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
          Pay<span className="text-indigo-600 dark:text-indigo-300">TM</span>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-700 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center px-4 pt-24 md:pt-32 pb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
          Fast, Secure
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">Money Transfers</span>
        </h1>
        <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
          Send money instantly to anyone. Manage your balance and view
          transaction history — all in one beautiful app.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition text-base"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="px-8 py-3 border border-gray-300 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-base"
          >
            Sign In
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full px-4">
          {[
            {
              icon: "⚡",
              title: "Instant",
              desc: "Send money in under a second with zero downtime.",
            },
            {
              icon: "🔒",
              title: "Secure",
              desc: "JWT-authenticated sessions, bcrypt-hashed passwords.",
            },
            {
              icon: "📈",
              title: "Trackable",
              desc: "Full transaction history with pagination.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-left border border-gray-100 dark:border-gray-700 hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {f.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
