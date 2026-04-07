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
    <div className="shadow h-14 flex justify-between">
      <div className="flex flex-col justify-center h-full ml-4">PayTM App</div>
      <div className="flex">
        <div className="flex flex-col justify-center h-full mr-4">
          Hello {userName || "User"}
        </div>
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
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
