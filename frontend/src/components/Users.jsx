import { useEffect, useState } from "react"
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const limit = 10;

    useEffect(() => {
        fetchUsers();
        fetchContacts();
    }, [filter, page]);

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/v1/user/bulk?filter=${filter}&page=${page}&limit=${limit}`,
                { headers: { Authorization: "Bearer " + token } }
            );
            const data = await response.json();
            setUsers(data.user || []);
            setTotal(data.total || 0);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        if (filter) return; // Only show contacts when not searching
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/v1/account/contacts?limit=5`,
                { headers: { Authorization: "Bearer " + token } }
            );
            const data = await response.json();
            setContacts(data.contacts || []);
        } catch {
            // silently fail
        }
    };

    const totalPages = Math.ceil(total / limit);

    return <>
        {/* Recent Contacts Section */}
        {!filter && contacts.length > 0 && (
            <div className="mb-6">
                <div className="font-bold text-lg mb-3 text-gray-700">
                    Recent Contacts
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {contacts.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => navigate("/send?id=" + contact._id + "&name=" + contact.firstName)}
                            className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-semibold shadow-md">
                                {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </div>
                            <div className="text-center mt-1 text-xs text-gray-600 truncate w-16">
                                {contact.firstName}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="font-bold mt-6 text-lg text-gray-700">
            {filter ? "Search Results" : "All Users"}
        </div>
        <div className="my-2">
            <input
                onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                }}
                value={filter}
                type="text" placeholder="Search users..." className="w-full px-3 py-2 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
        </div>

        {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
            <div>
                {users.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No users found</div>
                ) : (
                    users.map(user => <User key={user._id} user={user} navigate={navigate} />)
                )}
            </div>
        )}

        {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                    Prev
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                    Next
                </button>
            </div>
        )}
    </>
}

function User({user, navigate}) {
    return <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 flex justify-center mt-1 mr-3">
                <div className="flex flex-col justify-center h-full text-white font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center">
                <div className="font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                    {user.username}
                </div>
            </div>
        </div>

        <div>
            <Button onClick={() => {
                navigate("/send?id=" + user._id + "&name=" + user.firstName);
            }} label={"Send"} />
        </div>
    </div>
}