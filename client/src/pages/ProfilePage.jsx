import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'
import { getListedProducts } from '../services/product-api';
import { getUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Settings, Crown, Heart } from 'lucide-react';

export default function ProfilePage() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, userData] = await Promise.all([
                    getListedProducts(),
                    getUser()
                ]);
                setProducts(productsRes.data);
                setUser(userData);
            } catch (error) {
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <NavBar />
            <MobileBottomNav />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white text-2xl font-bold">
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'User'}</h1>
                                <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/account')}
                            className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-gray-200"
                        >
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <Settings size={24} />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">Account Settings</span>
                        </button>

                        <button
                            disabled
                            className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl opacity-50 cursor-not-allowed border border-gray-200"
                        >
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg transition-colors">
                                <Crown size={24} />
                            </div>
                            <span className="font-semibold text-gray-700">Premium (Coming Soon)</span>
                        </button>

                        <button
                            onClick={() => navigate('/favorites')}
                            className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-gray-200"
                        >
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-200 transition-colors">
                                <Heart size={24} />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">Favorites</span>
                        </button>
                    </div>
                </div>

                {/* My Products Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">My Products ({products.length})</h2>
                        <button
                            onClick={() => navigate('/myads')}
                            className="bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Manage Products
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => navigate(`/product/${p._id}`)}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                            >
                                <div className="w-full h-40 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        src={`${import.meta.env.VITE_BACKEND_URL}${p.images?.[0]?.url}`}
                                        alt={p.title}
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                                    <p className="text-lg font-bold text-primary mt-2">₹{p.price?.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {products.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No products listed yet</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
