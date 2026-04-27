import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Appbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="shadow h-14 flex justify-between items-center bg-white dark:bg-gray-800">
      <div
        className="flex flex-col justify-center h-full ml-4 cursor-pointer font-bold text-blue-600 dark:text-blue-400"
        onClick={() => navigate("/dashboard")}
      >
        PayTM App
      </div>
      <div className="flex items-center">
        <button
          onClick={() => navigate("/profile")}
          className="mr-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Profile
        </button>
        <div className="flex flex-col justify-center h-full mr-4 text-gray-800 dark:text-gray-200">
          Hello {userName || "User"}
        </div>
        <div className="rounded-full h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 flex justify-center mr-2">
          <div className="flex flex-col justify-center h-full text-white font-semibold">
            {initials}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 mr-4 flex items-center px-3 text-sm font-medium rounded bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};