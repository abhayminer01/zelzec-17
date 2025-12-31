import React, { useState } from 'react';
import { Heart, MapPin, Gauge, Fuel, Calendar } from 'lucide-react';
import { toggleFavorite } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const FavoriteProductCard = ({ product, navigate, onFavoriteChange }) => {
    const { userData, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(false);

    // Dynamic Fields
    const year = product.form_data?.Year || product.form_data?.year;
    const kmDriven = product.form_data?.km_driven || product.form_data?.KMDriven || product.form_data?.['KM Driven'];
    const fuel = product.form_data?.fuel || product.form_data?.Fuel;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price).replace('₹', '₹ ');
    };

    const handleRemoveFavorite = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const res = await toggleFavorite(product._id);
            if (res.success) {
                toast.success("Removed from favorites");
                if (onFavoriteChange) onFavoriteChange();
                checkAuthStatus();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove favorite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={product.images && product.images[0]?.url ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0].url}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Remove Button */}
                <button
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors z-10 hover:scale-105 active:scale-95 border border-red-100"
                    onClick={handleRemoveFavorite}
                    disabled={loading}
                    title="Remove from favorites"
                >
                    <Heart size={18} fill="currentColor" className={loading ? 'animate-pulse' : ''} />
                </button>

                {/* Badge (Location) */}
                {product.location?.place && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="font-medium truncate max-w-[120px]">{product.location.place}</span>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="p-3 sm:p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#8069AE] transition-colors">{formatPrice(product.price)}</h3>
                </div>

                <h4 className="text-sm font-medium text-gray-700 line-clamp-2 mb-3 min-h-[2.5em]">
                    {product.title}
                </h4>

                {/* Specs Grid */}
                <div className="mt-auto pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {year && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <Calendar size={12} className="text-[#8069AE]" />
                            <span>{year}</span>
                        </div>
                    )}
                    {kmDriven && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <Gauge size={12} className="text-[#8069AE]" />
                            <span>{kmDriven} km</span>
                        </div>
                    )}
                    {fuel && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md col-span-2 sm:col-span-1">
                            <Fuel size={12} className="text-[#8069AE]" />
                            <span>{fuel}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoriteProductCard;
