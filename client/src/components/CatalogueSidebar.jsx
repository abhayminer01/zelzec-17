import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MapPin, X } from 'lucide-react';

const CatalogueSidebar = ({
    filters,
    setFilters,
    dynamicFilters,
    setDynamicFilters,
    categories,
    selectedCategory,
    navigate
}) => {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        locations: true,
        price: true,
        brand: true,
        dynamic: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDynamicFilterChange = (label, value) => {
        setDynamicFilters(prev => ({ ...prev, [label]: value }));
    };

    // Helper to render dynamic fields based on field type
    const renderDynamicField = (field) => {
        if (field.type === 'select') {
            return (
                <div key={field.label} className="mt-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{field.title}</label>
                    <div className="space-y-1.5">
                        {field.options?.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded -ml-1">
                                <input
                                    type="checkbox"
                                    checked={dynamicFilters[field.label] === opt} // Ideally should support multiple, but sticking to single select for now as per logic
                                    onChange={() => handleDynamicFilterChange(field.label, dynamicFilters[field.label] === opt ? '' : opt)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }

        // Default to input for other types
        return (
            <div key={field.label} className="mt-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{field.title}</label>
                <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={`Filter by ${field.title}`}
                    value={dynamicFilters[field.label] || ''}
                    onChange={(e) => handleDynamicFilterChange(field.label, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
        );
    };

    return (
        <div className="w-full flex-shrink-0">
            <div className="bg-white lg:rounded-lg lg:shadow-sm lg:border border-gray-100 lg:sticky lg:top-24 overflow-hidden">

                {/* Categories Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('categories')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Categories</h3>
                        {expandedSections.categories ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {expandedSections.categories && (
                        <div className="px-4 pb-4">
                            <div
                                onClick={() => { handleFilterChange('category', ''); navigate('/catalogue'); }}
                                className={`py-2 px-3 rounded cursor-pointer text-sm font-medium transition-colors mb-1 ${!filters.category ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All Categories
                            </div>
                            <div className="space-y-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {categories.map(cat => (
                                    <div
                                        key={cat._id}
                                        onClick={() => handleFilterChange('category', cat._id)}
                                        className={`py-2 px-3 rounded cursor-pointer text-sm transition-colors ${filters.category === cat._id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {cat.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Locations Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('locations')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Locations</h3>
                        {expandedSections.locations ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {expandedSections.locations && (
                        <div className="px-4 pb-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search City..."
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                />
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Budget</h3>
                        {expandedSections.price ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {expandedSections.price && (
                        <div className="px-4 pb-4">
                            <p className="text-xs text-gray-500 mb-2">Choose range below</p>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                                    />
                                </div>
                                <span className="text-gray-400 text-sm">to</span>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic Filters Section */}
                {selectedCategory && selectedCategory.form_data && selectedCategory.form_data.length > 0 && (
                    <div className="border-b border-gray-100">
                        <button
                            onClick={() => toggleSection('dynamic')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{selectedCategory.title} Filters</h3>
                            {expandedSections.dynamic ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {expandedSections.dynamic && (
                            <div className="px-4 pb-4">
                                {selectedCategory.form_data.map(field => renderDynamicField(field))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default CatalogueSidebar;
