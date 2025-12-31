import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { getAllProducts } from '../services/product-api';
import MobileBottomNav from '../components/MobileBottomNav';

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Debounce search for suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery.trim()) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await getAllProducts({ search: searchQuery, limit: 10 });
                if (res?.success) {
                    setSuggestions(res.data);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = (query) => {
        if (!query.trim()) return;
        navigate(`/catalogue?search=${encodeURIComponent(query)}`);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(searchQuery);
                        }}
                        className="w-full bg-gray-100 h-10 rounded-full pl-10 pr-10 border-none focus:ring-2 focus:ring-primary/20 text-base"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-20">
                {searchQuery.trim().length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <p className="text-sm">Type to search for cars, mobiles, furniture and more...</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {/* Static "Search for" option */}
                        <div
                            onClick={() => handleSearch(searchQuery)}
                            className="px-4 py-3 flex items-center gap-3 text-primary font-medium border-b border-gray-50 active:bg-gray-50"
                        >
                            <Search size={18} />
                            <span>Search for "{searchQuery}"</span>
                        </div>

                        {isSearching && suggestions.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Searching...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    className="px-4 py-3 flex items-center gap-3 border-b border-gray-50 active:bg-gray-50 cursor-pointer"
                                >
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}${product.images?.[0]?.url}`}
                                        alt={product.title}
                                        className="w-10 h-10 rounded object-cover bg-gray-100 flex-shrink-0"
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-gray-900 text-sm font-medium line-clamp-1">{product.title}</span>
                                        <span className="text-gray-500 text-xs truncate">{product.category?.title} • ₹{product.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !isSearching && (
                                <div className="p-8 text-center text-gray-500 text-sm">No results found</div>
                            )
                        )}
                    </div>
                )}
            </div>

            <MobileBottomNav />
        </div>
    );
}
