import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import HomeProductCard from './HomeProductCard';

const ProductScrollSection = ({ title, products, categoryId, viewAllLink }) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 600;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    if (!products || products.length === 0) return null;

    const categoryName = title.replace('Latest in ', '');

    return (
        <div className="w-full mb-8">
            {/* Boxed Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            {categoryName}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Latest additions</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Navigation Arrows */}
                        <div className="hidden md:flex items-center gap-2 mr-1">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 border border-transparent hover:border-gray-200 transition-all active:scale-95"
                                aria-label="Scroll left"
                            >
                                <ChevronRight size={20} className="rotate-180" /> {/* Reusing ChevronRight rotated for consistency if ChevronLeft import issues, but ChevronLeft is better if imported. Use ChevronLeft if imported at top */}
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 border border-transparent hover:border-gray-200 transition-all active:scale-95"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => navigate(viewAllLink)}
                            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
                        >
                            View All
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Stream */}
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scrollbar-hide -mx-2 px-2" // Negative margin to allow hover effects to not be cut off
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((p) => (
                            <div
                                key={p._id}
                                className="flex-none w-[200px] xs:w-[240px] sm:w-[260px] snap-start"
                            >
                                <HomeProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductScrollSection;
