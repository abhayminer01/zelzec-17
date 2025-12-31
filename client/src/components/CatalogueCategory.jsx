// src/components/CatalogueCategory.jsx
import React from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const CatalogueCategory = ({ expandedSections, toggleSection }) => {
  return (
    <div className="w-full max-w-[300px] flex-shrink-0">
      {/* CATEGORIES */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-[11px] font-bold text-gray-900 mb-3 tracking-wide">CATEGORIES</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center text-sm text-gray-700">
            <span className="mr-2">−</span> All Categories
          </button>
          <button className="w-full text-left pl-5 text-sm text-[#6366F1] font-medium bg-[#F6F1FF] rounded">
            Cars
          </button>
        </div>
      </div>

      {/* LOCATIONS */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('locations')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">LOCATIONS</h3>
          {expandedSections.locations ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.locations && (
          <div className="space-y-2">
            <button className="w-full flex items-center text-sm text-gray-700">
              <span className="mr-2">−</span> India
            </button>
            <button className="w-full text-left pl-5 text-sm text-gray-700">
              Kerala
            </button>
            <button className="mt-3 text-sm text-gray-400">
              Filters
            </button>
          </div>
        )}
      </div>

      {/* BRAND AND MODEL */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">BRAND AND MODEL</h3>
          {expandedSections.brand ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.brand && (
          <div>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search brands or model"
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <div className="mb-4">
              <h4 className="text-[11px] font-bold text-gray-900 mb-2.5 tracking-wide">ALL BRANDS</h4>
              <div className="space-y-2">
                {['Maruti Suzuki', 'Hyundai', 'Mahindra', 'Toyota', 'Honda', 'Tata'].map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="w-3.5 h-3.5 border-2 border-gray-300 rounded-sm text-[#6366F1] focus:ring-0 focus:ring-offset-0" />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900 mb-2.5 tracking-wide">ALL MODELS</h4>
              <div className="space-y-2">
                {['Maruti Suzuki Swift', 'Maruti Suzuki Wagon R', 'Hyundai Creta', 'Honda City', 'Hyundai i20', 'Maruti Suzuki Ertiga'].map((model) => (
                  <label key={model} className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="w-3.5 h-3.5 border-2 border-gray-300 rounded-sm text-[#6366F1] focus:ring-0 focus:ring-offset-0" />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{model}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BUDGET */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('budget')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">BUDGET</h3>
          {expandedSections.budget ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.budget && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Choose from options below</p>
            <div className="space-y-1.5">
              {['Below 3 Lac', '3 Lac - 6 Lac', '6 Lac - 10 Lac', '10 Lac - 15 Lac', '15 Lac and Above'].map((range) => (
                <button
                  key={range}
                  className={`w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded ${
                    range === '15 Lac and Above' ? 'bg-[#F6F1FF]' : ''
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* YEAR */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('year')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">YEAR</h3>
          {expandedSections.year ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.year && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Choose from options below</p>
            <div className="space-y-1.5 mb-3">
              {['Under 3 Years', 'Under 5 Years', 'Under 7 Years', '7 Years and Above'].map((range) => (
                <button
                  key={range}
                  className={`w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded ${
                    range === 'Under 5 Years' ? 'bg-[#F6F1FF]' : ''
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-2">Choose a range below</p>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="2004" className="flex-1 w-3 px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:border-gray-400" />
              <span className="text-xs text-gray-500">to</span>
              <input type="text" placeholder="2025" className="flex-1 w-3 px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:border-gray-400" />
              <button className="px-3 py-1.5 bg-[#F6F1FF] text-black text-xs rounded hover:bg-white">
                apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NO. OF OWNERS */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('owners')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">NO. OF OWNERS</h3>
          {expandedSections.owners ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.owners && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Choose from below options</p>
            <div className="space-y-2">
              {['First', 'Second', 'Third', 'Fourth', 'More than Four'].map((owner) => (
                <label key={owner} className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 border-2 border-gray-300 rounded-sm text-[#6366F1] focus:ring-0 focus:ring-offset-0" />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{owner}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KM DRIVEN */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('kmDriven')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">KM DRIVEN</h3>
          {expandedSections.kmDriven ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.kmDriven && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Choose from options below (km)</p>
            <div className="space-y-1.5">
              {['Below 25000 km', '25000 km - 50000 km', '50000 km - 75000 km', '75000 km - 100000 km', '100000 km and Above'].map((range) => (
                <button
                  key={range}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FUEL */}
      <div className="border-b border-gray-200 p-4">
        <button 
          onClick={() => toggleSection('fuel')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">FUEL</h3>
          {expandedSections.fuel ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.fuel && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Choose from below options</p>
            <div className="space-y-2">
              {['Petrol', 'Diesel', 'LPG', 'CNG & Hybrids', 'Electric'].map((fuel) => (
                <label key={fuel} className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 border-2 border-gray-300 rounded-sm text-[#6366F1] focus:ring-0 focus:ring-offset-0" />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{fuel}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TRANSMISSION */}
      <div className="p-4">
        <button 
          onClick={() => toggleSection('transmission')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-[11px] font-bold text-gray-900 tracking-wide">TRANSMISSION</h3>
          {expandedSections.transmission ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {expandedSections.transmission && (
          <div className="space-y-1.5">
            {['Automatic', 'Manual'].map((trans) => (
              <button
                key={trans}
                className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded"
              >
                {trans}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueCategory;