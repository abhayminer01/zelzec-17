import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Search, Trash2, Edit, X } from "lucide-react";
import Swal from "sweetalert2";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        address: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(
            (user) =>
                user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase()) ||
                user.mobile?.toString().includes(search)
        );
        setFilteredUsers(filtered);
    }, [search, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/v1/admin/users", {
                withCredentials: true,
            });
            if (res.data.success) {
                setUsers(res.data.data);
                setFilteredUsers(res.data.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to fetch users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the user and their data instantly!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/v1/admin/users/${userId}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    Swal.fire("Deleted!", "User has been deleted.", "success");
                    fetchUsers();
                }
            } catch (error) {
                Swal.fire("Error", "Failed to delete user", "error");
            }
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            address: user.address || ""
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/v1/admin/users/${selectedUser._id}`, editFormData, {
                withCredentials: true
            });
            if (res.data.success) {
                Swal.fire("Success", "User updated successfully", "success");
                setIsEditOpen(false);
                fetchUsers();
            }
        } catch (error) {
            Swal.fire("Error", "Failed to update user", "error");
        }
    }

    const handleInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="overflow-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Users</h1>

                {/* Search */}
                <div className="mb-6 relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 text-sm uppercase font-semibold">
                            <tr>
                                <th className="p-4 border-b">Name</th>
                                <th className="p-4 border-b">Email</th>
                                <th className="p-4 border-b">Mobile</th>
                                <th className="p-4 border-b">Joined Date</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center">Loading...</td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{user.full_name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.mobile || "N/A"}</td>
                                        <td className="p-4">{format(new Date(user.createdAt), "dd MMM yyyy")}</td>
                                        <td className="p-4 flex justify-center gap-3">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsEditOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={editFormData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={editFormData.mobile}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
