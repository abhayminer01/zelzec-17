import React, { useEffect, useState } from "react";
import { useSell } from "../../contexts/SellContext";
import { getCategoryForm } from "../../services/category-api";
import * as Icons from "lucide-react";

export default function AddDetails() {
  const [form, setForm] = useState([]);
  const { handleFormDataChange, handleChange, nextStep, prevStep, clearStep } = useSell();

  useEffect(() => {
    fetchCategoryForm();
  }, []);

  const fetchCategoryForm = async () => {
    try {
      const category = localStorage.getItem("category");
      const req = await getCategoryForm(category);
      if (req.success) {
        setForm(req.data.form_data || []);
      }
    } catch (err) {
      console.error("Error fetching category form:", err);
    }
  };

  const handleForm = (e) => {
    e.preventDefault();
    // Perform validation (HTML5 required attributes will handle it automatically)
    nextStep();
  };

  return (
    <div onClick={() => clearStep()} className="fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[450px] md:h-auto p-6 md:p-8 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6 md:mb-4">
          <button onClick={prevStep} className="md:hidden mr-3">
            <Icons.ArrowLeft className="size-6 text-gray-700" />
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-left md:text-center flex-1 md:flex-none">
            Add Details
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleForm} className="w-full flex flex-col gap-5">
          {/* Dynamic Fields */}
          {form.map((field) => (
            <div key={field._id} className="flex flex-col">
              <label className="font-medium mb-2 text-sm">
                {field.title}
                <span className="text-red-500 ml-1">*</span>
              </label>

              {field.type === "select" ? (
                <select
                  required
                  name={field.label}
                  onChange={handleFormDataChange}
                  className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select {field.title}
                  </option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type={field.type || "text"}
                  name={field.label}
                  placeholder={field.title}
                  onChange={handleFormDataChange}
                  className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              )}
            </div>
          ))}

          {/* Static Fields */}
          <div className="flex flex-col">
            <label className="font-medium mb-2 text-sm">
              Ad Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="title"
              placeholder="Ad Title"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-2 text-sm">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="bg-primary w-full py-3 text-white rounded-lg hover:bg-primary/90 font-medium mt-2"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
