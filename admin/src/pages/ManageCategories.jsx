import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  togglePrimary,
} from "../services/category-api";
import { Pencil, Trash2, Plus, X, Star, Menu, Search } from "lucide-react";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    icon: "",
    form_data: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAll = async () => {
    const res = await getAllCategories();
    if (res?.success) setCategories(res.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setEditForm({ ...cat });
    setIsEditing(false);
  };

  const handleNewCategory = () => {
    const newCat = {
      _id: "new",
      title: "",
      description: "",
      icon: "",
      form_data: [],
    };
    setSelectedCategory(newCat);
    setEditForm(newCat);
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (index, key, value) => {
    setEditForm((prev) => {
      const updated = [...(prev.form_data || [])];
      updated[index] = { ...updated[index], [key]: value };
      if (key === "type" && value !== "select") updated[index].options = [];
      return { ...prev, form_data: updated };
    });
  };

  const addFormField = () => {
    setEditForm((prev) => ({
      ...prev,
      form_data: [
        ...(prev.form_data || []),
        { title: "", label: "", type: "text", options: [] },
      ],
    }));
  };

  const removeFormField = (index) => {
    setEditForm((prev) => {
      const updated = [...(prev.form_data || [])].filter((_, i) => i !== index);
      return { ...prev, form_data: updated };
    });
  };

  const handleSave = async () => {
    try {
      let res;
      if (selectedCategory._id === "new") {
        res = await createCategory(editForm);
      } else {
        res = await updateCategory(selectedCategory._id, editForm);
      }

      if (res.success) {
        toast.success(
          selectedCategory._id === "new"
            ? "Category created successfully"
            : "Category updated successfully"
        );
        fetchAll();
        setSelectedCategory(res.data);
        setEditForm(res.data);
        setIsEditing(false);
      } else toast.error("Operation failed");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const res = await deleteCategory(id);
    if (res.success) {
      toast.success("Category deleted");
      fetchAll();
      if (selectedCategory?._id === id) setSelectedCategory(null);
    } else toast.error("Failed to delete");
  };

  const handlePrimary = async (id) => {
    const res = await togglePrimary(id);
    if (res.success) {
      toast.success("Marked as primary");
      fetchAll();
    } else toast.error("Something went wrong");
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
            <p className="text-gray-500 text-sm mt-1">Define category data fields and icons.</p>
          </div>
          <button
            onClick={handleNewCategory}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <Plus size={18} /> New Category
          </button>
        </div>
      </header>

      {/* Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="overflow-y-auto max-h-[70vh] space-y-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedCategory?._id === cat._id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-100 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {cat.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {cat.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrimary(cat._id);
                        }}
                        className={`p-1.5 rounded-full transition ${cat.primary
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-500 hover:text-yellow-600"
                          }`}
                      >
                        <Star
                          size={13}
                          fill={cat.primary ? "#facc15" : "none"}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cat._id);
                        }}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">
                {searchTerm ? "No matches found" : "No categories yet."}
              </p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {selectedCategory ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Menu size={18} className="text-gray-400" />
                  {selectedCategory._id === "new"
                    ? "New Category"
                    : editForm.title || "Untitled"}
                </h2>

                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ ...selectedCategory });
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {["title", "description", "icon"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-600 capitalize mb-1">
                        {field}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name={field}
                          value={editForm[field] || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-800">
                          {editForm[field] || "—"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Form Fields Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Form Fields</h3>
                    {isEditing && (
                      <button
                        onClick={addFormField}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        + Add Field
                      </button>
                    )}
                  </div>

                  {editForm.form_data?.length > 0 ? (
                    <div className="space-y-3">
                      {editForm.form_data.map((f, i) => (
                        <div
                          key={i}
                          className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative"
                        >
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeFormField(i)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Key</label>
                              {isEditing ? (
                                <input
                                  value={f.title}
                                  onChange={(e) =>
                                    handleFieldChange(i, "title", e.target.value)
                                  }
                                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              ) : (
                                <p className="mt-1 text-sm">{f.title || "—"}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Label</label>
                              {isEditing ? (
                                <input
                                  value={f.label}
                                  onChange={(e) =>
                                    handleFieldChange(i, "label", e.target.value)
                                  }
                                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              ) : (
                                <p className="mt-1 text-sm">{f.label || "—"}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Type</label>
                              {isEditing ? (
                                <select
                                  value={f.type}
                                  onChange={(e) =>
                                    handleFieldChange(i, "type", e.target.value)
                                  }
                                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="select">Select</option>
                                </select>
                              ) : (
                                <p className="mt-1 text-sm capitalize">{f.type}</p>
                              )}
                            </div>
                          </div>

                          {f.type === "select" && (
                            <div className="mt-3">
                              <label className="text-xs text-gray-500">
                                Options (comma-separated)
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={f.options?.join(", ") || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      i,
                                      "options",
                                      e.target.value
                                        .split(",")
                                        .map((opt) => opt.trim())
                                    )
                                  }
                                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              ) : (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {f.options?.map((opt, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-white text-xs rounded border"
                                    >
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-3">
                      {isEditing
                        ? "Click 'Add Field' to add form data."
                        : "No form fields defined."}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Plus size={24} className="text-gray-400" />
              </div>
              <p>Select a category or create a new one.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
