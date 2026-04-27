import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import toast from "react-hot-toast";

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/user/me`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to load profile");
      }
      const data = await res.json();
      setUser(data);
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
    } catch (err) {
      toast.error(err.message || "Failed to load profile. Please check your connection.");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/user/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ firstName, lastName })
      });
      if (res.ok) {
        toast.success("Profile updated!");
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) {
        toast.success("Password changed successfully!");
        // Clear password fields after success
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Password change failed");
      }
    } catch (err) {
      toast.error("Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <Appbar />
      <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-right text-xs text-gray-400 mb-2">v2.0</div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Profile</h2>

        {/* Profile Update Form */}
        <form onSubmit={handleUpdate} className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={user?.username || ""} disabled className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Change Password</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};