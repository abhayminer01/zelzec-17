import React, { useEffect, useState } from "react";
import {
  getAllAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
} from "../services/auth";
import { toast, Toaster } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const fetchAllAdmins = async () => {
    const res = await getAllAdmins();
    if (res?.success) setAdmins(res.data);
  };

  useEffect(() => {
    fetchAllAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const res = await updateAdmin(editingAdmin._id, form);
        if (res?.success) toast.success("Admin updated successfully");
      } else {
        const res = await registerAdmin(form);
        if (res?.success) toast.success("Admin created successfully");
      }
      setForm({ name: "", email: "", password: "" });
      setShowModal(false);
      setEditingAdmin(null);
      fetchAllAdmins();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    const res = await deleteAdmin(id);
    if (res?.success) {
      toast.success("Admin deleted successfully");
      fetchAllAdmins();
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: "" });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <main className="p-8">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[1.7rem] font-semibold text-gray-800 tracking-tight">
              Manage Admins
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, update, or remove admin accounts.
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-[#6D4AFF] hover:bg-[#5b3ee0] text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> <span className="text-sm font-medium">New Admin</span>
          </button>
        </div>

        {/* Admin List */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          {admins.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {admins.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between py-4 group hover:bg-gray-50 px-2 rounded-lg transition-all"
                >
                  <div>
                    <h1 className="font-medium text-gray-800">{a.name}</h1>
                    <p className="text-sm text-gray-500">{a.email}</p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(a)}
                      className="text-gray-500 hover:text-blue-600 transition"
                      title="Edit Admin"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-gray-500 hover:text-red-600 transition"
                      title="Delete Admin"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-16 text-sm">
              No admins found.
            </p>
          )}
        </section>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setEditingAdmin(null);
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-lg w-[400px] p-8 relative animate-fadeIn border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAdmin(null);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h1 className="text-xl font-semibold mb-1 text-gray-800">
                {editingAdmin ? "Edit Admin" : "Create Admin"}
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                {editingAdmin ? "Update admin details" : "Add a new admin"}
              </p>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    name="name"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-xl h-10 px-3 focus:ring-2 focus:ring-[#6D4AFF] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-xl h-10 px-3 focus:ring-2 focus:ring-[#6D4AFF] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder={
                      editingAdmin ? "New password (optional)" : "Enter password"
                    }
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-xl h-10 px-3 focus:ring-2 focus:ring-[#6D4AFF] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#6D4AFF] hover:bg-[#5b3ee0] text-white py-2.5 rounded-xl font-medium transition-all"
                >
                  {editingAdmin ? "Update Admin" : "Create Admin"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
