import React, { useState } from 'react'
import { useSell } from '../../contexts/SellContext'
import { createProduct } from '../../services/product-api';
import { toast } from "sonner";
import { ArrowLeft, IndianRupee } from "lucide-react";

export default function SetPrice() {
  const { handleChange, nextStep, prevStep, data, clearStep } = useSell();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await createProduct(data);
      if (res.success) {
        nextStep();
      } else {
        toast.error("Something bad occurs", {
          description: `${res.message || res.err}`,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => clearStep()}
      className="fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[400px] md:h-auto p-6 md:p-8 flex flex-col relative"
      >
        <div className="flex items-center mb-6 md:mb-10">
          <button
            onClick={prevStep}
            className="md:hidden mr-3"
            type="button"
          >
            <ArrowLeft className="size-6 text-gray-700" />
          </button>
          <h1 className="text-xl md:text-lg font-semibold text-left md:text-center flex-1 md:flex-none">
            Set Price
          </h1>
        </div>
        <div className="relative w-full mb-6">
          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
          <input
            onChange={handleChange}
            name="price"
            className="border border-gray-300 pl-12 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-lg"
            type="number"
            placeholder="0"
          />
        </div>
        <div className="flex-1 md:flex-none"></div>
        <div className="pb-24 md:pb-0">
          <button
            onClick={handleNext}
            disabled={loading}
            className={`bg-primary w-full py-3 rounded-xl text-white font-medium transition
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90"}`}
            type="button"
          >
            {loading ? "Posting..." : "Post Ad"}
          </button>
        </div>
      </div>
    </div>
  );
}
