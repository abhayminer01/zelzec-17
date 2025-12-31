import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Heart } from 'lucide-react';

const ProductInfoCard = ({ product, onChatClick, onMakeOfferClick, isOwner, currentUserId, isFavorite, onFavoriteToggle }) => {
    const navigate = useNavigate();
    const seller = product.user || {};
    const price = product.price;

    // Helper to format date as "26th October 2025"
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        const suffix = (d) => {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${suffix(day)} ${month} ${year}`;
    };

    return (
        <div className="w-full h-full bg-[#F3E8FF] p-8 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col justify-between">
            {/* Favorite Button */}
            {!isOwner && (
                <button
                    onClick={onFavoriteToggle}
                    className="absolute top-6 right-6 p-2.5 bg-white/50 hover:bg-white rounded-full transition-all text-gray-500 hover:text-red-500 z-20"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-red-500" : ""} />
                </button>
            )}

            {/* Price Section */}
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-5xl font-medium text-black mb-6 tracking-tight">
                    ₹ {price?.toLocaleString('en-IN') || 'N/A'}
                </h1>

                {!isOwner && (
                    <button
                        onClick={onMakeOfferClick}
                        className="w-full bg-[#7C5CB9] hover:bg-[#6c4ea6] text-white text-lg font-normal py-4 rounded-xl transition-all shadow-sm mb-3"
                    >
                        Make offer
                    </button>
                )}

                <p className="text-[11px] text-black font-medium mt-1">
                    Posted on: {formatDate(product.createdAt)}
                </p>
            </div>

            {/* Seller Section (Inner Card) */}
            {!isOwner ? (
                <div className="bg-[#FdfCFF] p-5 rounded-[20px] shadow-sm relative z-10 w-[90%] mx-auto">
                    <div className="flex items-center gap-4 mb-5 justify-center">
                        <img
                            src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.full_name || 'Seller')}&background=7C5CB9&color=fff`}
                            alt={seller.full_name || 'Seller'}
                            className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-black text-[15px] leading-tight">
                                {seller.full_name || 'Name Line 1'}
                            </span>
                            <span className="text-[11px] text-black font-normal mt-0.5">
                                {product.location?.place || 'Seller Type'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onChatClick}
                        className="w-full bg-[#7C5CB9] hover:bg-[#6c4ea6] text-white text-lg font-normal py-3.5 rounded-xl transition-all shadow-sm"
                    >
                        Chat with seller
                    </button>
                </div>
            ) : (
                <div className="bg-white/80 p-5 rounded-[20px] border border-purple-100 text-center">
                    <p className="text-gray-700 font-medium leading-relaxed mb-4">
                        You can edit or delete your advertisement from the My Ads Settings
                    </p>
                    <button
                        onClick={() => navigate('/myads')}
                        className="bg-[#7C5CB9] hover:bg-[#6c4ea6] text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-sm"
                    >
                        Manage Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductInfoCard;