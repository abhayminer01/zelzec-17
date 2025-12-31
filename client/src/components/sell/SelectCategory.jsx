import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import { useSell } from "../../contexts/SellContext";
import { getPrimaryCategories, getAllCategories } from "../../services/category-api";
import MobileBottomNav from "../MobileBottomNav";

export default function SelectCategory() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { closeLogin } = useModal();
  const {
    step,
    nextStep,
    prevStep,
    handleCategorySelect
  } = useSell();

  useEffect(() => {
    fetchPrimaryCategories();
  }, []);

  const handleBackdropClick = () => {
    if (viewMode === 'list') {
      setViewMode('grid');
    } else {
      prevStep();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const fetchPrimaryCategories = async () => {
    const req = await getPrimaryCategories();
    if (req.success) {
      setCategories(req.data);
    }
  }

  const handleMoreCategories = async () => {
    setViewMode('list');
    if (allCategories.length === 0) {
      const req = await getAllCategories();
      if (req.success) {
        setAllCategories(req.data);
      }
    }
  };

  const handleBack = () => {
    if (viewMode === 'list') {
      setViewMode('grid');
    } else {
      prevStep();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[450px] md:h-auto p-6 md:p-8 flex flex-col relative overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="flex items-center mb-6 md:mb-6">
          <button
            onClick={handleBack}
            className="md:hidden mr-3"
          >
            <Icons.ArrowLeft className="size-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-left md:text-center flex-1 md:flex-none">
            {viewMode === 'list' ? 'All Categories' : 'What are you Selling?'}
          </h1>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:gap-10 w-full">
              {categories.map((item, index) => {
                const Icon = Icons[item.icon];
                return (
                  <button
                    onClick={() => {
                      handleCategorySelect(item._id);
                      localStorage.setItem('category', item._id);
                      nextStep();
                    }}
                    key={index}
                    className="flex flex-col items-center justify-center border border-gray-300 rounded-lg py-6 md:py-4 hover:border-primary hover:text-primary transition"
                  >
                    {Icon && <Icon className="size-8 md:size-6 text-primary mb-2 md:mb-1" />}
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleMoreCategories}
              className="flex flex-col w-full mt-6 md:mt-10 items-center justify-center border border-gray-300 rounded-lg py-6 md:py-4 hover:border-primary hover:text-primary transition"
            >
              <Icons.MoreHorizontal className="text-primary size-6" />
              <span className="text-sm font-medium">More Categories</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            {allCategories.map((item, index) => {
              // Use a default icon if item.icon is missing or invalid, though primary cats usually have them.
              // For all categories, we might want a generic fallback if icon isn't present.
              const Icon = item.icon ? Icons[item.icon] : Icons.Package;
              return (
                <button
                  key={item._id || index}
                  onClick={() => {
                    handleCategorySelect(item._id);
                    localStorage.setItem('category', item._id);
                    nextStep();
                  }}
                  className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {Icon && <Icon size={20} />}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    {/* Optional: Add description if available, mimicking chat preview subtitle */}
                    {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                  </div>
                  <Icons.ChevronRight className="size-4 text-gray-400 group-hover:text-primary transition-colors" />
                </button>
              );
            })}
            {allCategories.length === 0 && (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}