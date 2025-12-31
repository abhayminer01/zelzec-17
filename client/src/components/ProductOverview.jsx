// src/components/ProductOverview.jsx
import React from 'react';

const ProductOverview = ({ product }) => {
    const form_data = product.form_data || {};

    // Format key to be more readable
    const formatLabel = (key) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overview</h2>

            {/* Dynamic Grid for all form data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 mb-8">
                {Object.entries(form_data).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 opacity-80">{formatLabel(key)}</span>
                        <span className="text-sm font-bold text-gray-900">{value?.toString() || 'N/A'}</span>
                    </div>
                ))}
            </div>

            <hr className="border-gray-100 mb-8" />

            <div className="text-sm text-gray-700 leading-relaxed">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <div className="whitespace-pre-line text-gray-600">
                    {product.description || "No description available."}
                </div>
            </div>
        </div>
    );
};

export default ProductOverview;