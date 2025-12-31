import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Gauge, Share2 } from 'lucide-react';

import { toggleFavorite } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const CatalogueProductCard = ({ product, navigate, onFavoriteChange }) => {
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const { userData, checkAuthStatus } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (userData?.favorites?.includes(product._id)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [userData, product._id]);

    const handleFavorite = async (e) => {
        e.stopPropagation();
        if (!userData) {
            Swal.fire({
                title: 'Login Required',
                text: 'You need to be logged in to add to favorites.',
                icon: 'warning',
                confirmButtonColor: '#8069AE'
            });
            return;
        }

        // Optimistic update
        setIsFavorite(!isFavorite);

        try {
            const res = await toggleFavorite(product._id);
            if (res.success) {
                toast.success(res.message);
                checkAuthStatus(); // Refresh user data to update favorites list in context
                if (onFavoriteChange) {
                    onFavoriteChange();
                }
            } else {
                // Revert on failure
                setIsFavorite(!isFavorite);
                toast.error(res.message);
            }
        } catch (error) {
            setIsFavorite(!isFavorite);
            console.error(error);
        }
    };

    // Extract specific dynamic fields if they exist for better display
    const year = product.form_data?.Year || product.form_data?.year;
    const kmDriven = product.form_data?.km_driven || product.form_data?.KMDriven || product.form_data?.['KM Driven'];
    const fuel = product.form_data?.fuel || product.form_data?.Fuel;

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price).replace('₹', '₹ ');
    };

    const handleShare = (e) => {
        e.stopPropagation();
        setShowShare(!showShare);
        setCopied(false);
    };

    const copyLink = (e) => {
        e.stopPropagation();
        const link = `${window.location.origin}/product/${product._id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => {
            setShowShare(false);
            setCopied(false);
        }, 2000);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const close = () => setShowShare(false);
        if (showShare) window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [showShare]);


    return (
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-row group h-[140px] sm:h-[180px] relative">

            {/* Image Section */}
            <div
                className="w-[130px] sm:w-[260px] h-full relative flex-shrink-0 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product._id}`)}
            >
                <img
                    src={product.images && product.images[0]?.url ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0].url}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Updated Image Count Badge - Bottom Left */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                    <span className="font-medium">{product.images?.length || 0}</span>
                </div>

                <button
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${isFavorite ? 'bg-white text-red-500 hover:bg-gray-100' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'}`}
                    onClick={handleFavorite}
                >
                    <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between relative min-w-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1 mr-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">{formatPrice(product.price)}</h3>
                        <p className="hidden sm:block text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide truncate">
                            {(() => {
                                const catTitle = product.category?.title || '';
                                const brand = product.form_data?.Brand || product.form_data?.brand;
                                const model = product.form_data?.Model || product.form_data?.model;

                                const isVehicle = ['car', 'vehicle', 'motor', 'bike', 'scooter'].some(k => catTitle.toLowerCase().includes(k));

                                if (isVehicle) {
                                    if (brand && model) return `${brand} • ${model}`;
                                    if (brand) return `${brand}`;
                                    return catTitle;
                                }

                                const secondary = model || brand;
                                if (secondary) return `${catTitle} • ${secondary}`;
                                return catTitle;
                            })()}
                        </p>
                        <h4
                            className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors leading-tight"
                            onClick={() => navigate(`/product/${product._id}`)}
                        >
                            {product.title}
                        </h4>
                    </div>

                    {/* Share Button & Modal */}
                    <div className="relative flex-shrink-0">
                        <button
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                            onClick={handleShare}
                        >
                            <Share2 size={16} sm:size={18} />
                        </button>

                        {showShare && (
                            <div
                                className="absolute right-0 top-8 bg-white shadow-xl border border-gray-100 rounded-lg p-3 w-64 z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="text-xs font-semibold text-gray-700">Share this product</p>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
                                    <input
                                        readOnly
                                        value={`${window.location.origin}/product/${product._id}`}
                                        className="text-xs text-gray-500 bg-transparent flex-1 outline-none truncate"
                                    />
                                    <button
                                        onClick={copyLink}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Copy Link"
                                    >
                                        {copied ? <span className="text-green-600 text-[10px] font-bold">Copied!</span> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-4 mt-2">
                    {year && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={12} className="text-gray-400" />
                            <span>{year}</span>
                        </div>
                    )}
                    {kmDriven && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Gauge size={12} className="text-gray-400" />
                            <span className="truncate">{kmDriven} km</span>
                        </div>
                    )}
                    {product.location?.place && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 sm:col-span-1">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="truncate">{product.location.place}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 flex justify-end">
                </div>

            </div>
        </div>
    );
};

export default CatalogueProductCard;
