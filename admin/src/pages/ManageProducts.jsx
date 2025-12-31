import React, { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "../services/product-api";
import { getAllCategories } from "../services/category-api";
import { Search, Trash2, Filter, SlidersHorizontal } from "lucide-react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { format } from "date-fns";

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
    const [showUnknownOnly, setShowUnknownOnly] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [search, selectedCategory, sortOrder, showUnknownOnly]);

    const fetchCategories = async () => {
        const res = await getAllCategories();
        if (res?.success) setCategories(res.data);
    };

    const fetchProducts = async () => {
        setLoading(true);
        const params = {
            search,
            category: selectedCategory,
            sort: sortOrder,
            unknownUser: showUnknownOnly,
            limit: 100 // Fetch a reasonable amount, pagination can be added if needed
        };

        const res = await getAllProducts(params);
        if (res?.success) {
            setProducts(res.data);
        } else {
            toast.error("Failed to load products");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Product?",
            text: "Please provide a reason for this action. This will be sent to the user.",
            input: "textarea",
            inputPlaceholder: "Enter reason for deletion...",
            inputAttributes: {
                "aria-label": "Type your message here"
            },
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#3b82f6",
            confirmButtonText: "Yes, delete it!",
            inputValidator: (value) => {
                if (!value) {
                    return "You need to write a reason!";
                }
            }
        });

        if (result.isConfirmed) {
            const reason = result.value;
            const res = await deleteProduct(id, reason);
            if (res?.success) {
                toast.success("Product deleted successfully");
                fetchProducts();
            } else {
                toast.error(res.message || "Failed to delete product");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Manage Products</h1>
                    <p className="text-gray-500 mt-1">View, filter, and manage user products.</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        {/* Category Filter */}
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:w-48 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div className="relative flex-1 md:flex-none">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full md:w-48 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Unknown User Filter */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="unknownUser"
                            checked={showUnknownOnly}
                            onChange={(e) => setShowUnknownOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="unknownUser" className="text-sm text-gray-700 whitespace-nowrap">Unknown Only</label>
                    </div>
                </div>
            </div>

            {/* Product Grid/List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading products...</div>
                ) : products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0]?.url
                                                        ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0].url}`
                                                        : "https://placehold.co/100?text=No+Image"}
                                                    alt={product.title}
                                                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                                    onError={(e) => e.target.src = "https://placehold.co/100?text=Error"}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 line-clamp-1">{product.title}</p>
                                                    <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                                                {product.category?.title || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            ₹{Number(product.price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {product.user?.full_name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {product.createdAt ? format(new Date(product.createdAt), "dd MMM yyyy") : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Filter size={24} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">No products found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            <div className="mt-4 text-right text-xs text-gray-400">
                Showing {products.length} products
            </div>
        </div>
    );
}
