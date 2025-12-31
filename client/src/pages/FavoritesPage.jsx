import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import MobileBottomNav from '../components/MobileBottomNav';
import FavoriteProductCard from '../components/FavoriteProductCard';
import { getFavorites } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Footer from '../components/Footer';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getFavorites();
            if (res.success) {
                setFavorites(res.data);
            }
        } catch (error) {
            console.error("Error fetching favorites", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <NavBar />
            <MobileBottomNav />

            <main className="flex-1 pb-20 md:pb-8">
                {/* Banner Section */}
                <div className="h-48 bg-gradient-to-r from-[#604D85] to-[#8069AE] w-full relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="max-w-7xl mx-auto px-4 h-full flex items-center relative z-10 text-white">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/20 shadow-lg">
                                <Heart className="text-white fill-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">My Favorites</h1>
                                <p className="text-purple-100 font-medium opacity-90">Manage your saved listings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8069AE] border-t-transparent mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading your favorites...</p>
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                            {favorites.map((product) => (
                                <FavoriteProductCard
                                    key={product._id}
                                    product={product}
                                    navigate={navigate}
                                    onFavoriteChange={() => {
                                        setFavorites(prev => prev.filter(p => p._id !== product._id));
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className="bg-[#8069AE]/10 p-6 rounded-full mb-6">
                                <Heart className="w-16 h-16 text-[#8069AE]" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                Start browsing our catalogue and save items you love to find them easily here later.
                            </p>
                            <button
                                onClick={() => navigate('/catalogue')}
                                className="px-8 py-3 bg-[#8069AE] text-white rounded-xl font-medium hover:bg-[#6A5299] transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                Browse Catalogue
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
