import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    // Safe accessors
    const title = product.title || "Untitled Product";
    const price = product.price ? `₹${product.price.toLocaleString()}` : "Price On Request";

    // Subtitle logic: Use description, or construct from category/brand if description is empty/short
    const subtitle = product.description || product.category?.title || "No description available";

    const image = product.images?.[0]?.url
        ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0].url}`
        : '/placeholder.png';

    return (
        <div
            onClick={handleCardClick}
            className="group flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100"
        >
            {/* Image Area - Aspect Ratio 4:3 */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content Area */}
            <div className="flex flex-col p-4 gap-1">
                {/* Title */}
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {/* Subtitle / Description */}
                <p className="text-xs text-gray-500 line-clamp-1">
                    {subtitle}
                </p>

                {/* Price */}
                <div className="mt-2">
                    <span className="text-base font-bold text-gray-900">{price}</span>
                </div>
            </div>
        </div>
    );
};

export default HomeProductCard;
