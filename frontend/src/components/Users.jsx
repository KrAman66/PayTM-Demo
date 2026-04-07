import { useEffect, useState } from "react"
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const limit = 10;

    useEffect(() => {
        fetchUsers();
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
            // silently fail on empty state
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return <>
        <div className="font-bold mt-6 text-lg">
            Users
        </div>
        <div className="my-2">
            <input
                onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                }}
                value={filter}
                type="text" placeholder="Search users..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
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
    return <div className="flex justify-between">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName?.[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-full">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center h-full">
            <Button onClick={() => {
                navigate("/send?id=" + user._id + "&name=" + user.firstName);
            }} label={"Send Money"} />
        </div>
    </div>
}
