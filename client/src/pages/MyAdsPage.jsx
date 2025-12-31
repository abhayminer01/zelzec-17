import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'
import { getListedProducts, deleteProduct } from '../services/product-api';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Trash2, Edit2 } from 'lucide-react';
import EditProductModal from '../components/EditProductModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function MyAdsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await getListedProducts();
            if (res?.success) {
                setProducts(res.data);
            } else {
                console.error("Failed to fetch products", res);
            }
        } catch (error) {
            console.error("Error loading ads:", error);
            toast.error('Failed to load your ads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setProductToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        const loader = toast.loading("Deleting ad...");
        const res = await deleteProduct(productToDelete);
        toast.dismiss(loader);

        if (res.success) {
            toast.success("Ad deleted successfully");
            setProducts(prev => prev.filter(p => p._id !== productToDelete));
            setShowDeleteModal(false);
            setProductToDelete(null);
        } else {
            toast.error(res.message || "Failed to delete ad");
        }
    };

    const handleEdit = (e, product) => {
        e.stopPropagation();
        setEditingProduct(product);
    };

    const handleUpdateSuccess = () => {
        fetchProducts(); // Refresh list to get updated details
        setEditingProduct(null);
    };



    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Toaster position="top-right" />
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-right" />
            <NavBar />

            <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Ads ({products.length})</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => navigate(`/product/${p._id}`)}
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
                            >
                                <div className="w-full h-48 overflow-hidden relative bg-gray-100">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={`${import.meta.env.VITE_BACKEND_URL}${p.images?.[0]?.url}`}
                                        alt={p.title}
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#8069AE] shadow-sm">
                                        ₹{p.price?.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="p-4 flex-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-1 text-lg mb-1">{p.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10 leading-relaxed">{p.description}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-medium">
                                        <span>Posted {new Date(p.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Visible Action Footer */}
                                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                                    <button
                                        onClick={(e) => handleEdit(e, p)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#8069AE] hover:text-[#8069AE] transition-all shadow-sm active:scale-95"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, p._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <span className="text-4xl">📢</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No ads yet</h3>
                            <p className="mb-6">Start selling your items today!</p>
                            <button
                                onClick={() => navigate('/sell')} // Assuming /sell or using context to open sell modal
                                className="px-6 py-2 bg-[#8069AE] text-white rounded-lg hover:bg-[#6b5894] transition-colors shadow-lg shadow-purple-200"
                            >
                                Post an Ad
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onUpdate={handleUpdateSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Advertisement"
                description="Are you sure you want to delete this ad? This action cannot be undone and will remove it from the marketplace."
                confirmText="Delete Ad"
                confirmType="danger"
            />

            <MobileBottomNav />
            <Footer />
        </div>
    )
}
