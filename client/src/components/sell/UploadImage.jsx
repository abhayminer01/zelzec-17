import React, { useRef, useState, useEffect } from "react";
import { Plus, X, ArrowLeft } from "lucide-react";
import { useSell } from "../../contexts/SellContext";
import imageCompression from "browser-image-compression";


export default function UploadImage({ onNext }) {
  const { data, handleImageChange, nextStep, prevStep, clearStep } = useSell();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(data.images || []);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (data.images) setImages(data.images);
  }, [data.images]);

  const handleFileChange = async (e) => {
    setLoading(true);
    setError("");
    const files = Array.from(e.target.files);

    // Calculate how many more images can be added
    const remainingSlots = 6 - images.length;

    if (remainingSlots <= 0) {
      setError("You have reached the limit of 6 images.");
      setLoading(false);
      return;
    }

    let filesToProcess = files;
    if (files.length > remainingSlots) {
      filesToProcess = files.slice(0, remainingSlots);
      setError(`Only ${remainingSlots} image(s) could be added. Limit is 6.`);
      // Don't return, proceed with processing the allowed files
    }

    try {
      const compressedPreviews = await Promise.all(
        filesToProcess.map(async (file) => {
          const options = {
            maxSizeMB: 0.3, // target ~300KB per image
            maxWidthOrHeight: 1080, // resize if larger
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          return {
            file: compressedFile,
            url: URL.createObjectURL(compressedFile),
          };
        })
      );
      setLoading(false);

      const updated = [...images, ...compressedPreviews];
      setImages(updated);
      handleImageChange(updated);
    } catch (err) {
      console.error("Error compressing images:", err);
      setError("Error compressing images. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = (url) => {
    const updated = images.filter((img) => img.url !== url);
    setImages(updated);
    handleImageChange(updated);
    setError(""); // clear any previous error
  };

  const handleNext = () => {
    if (images.length === 0) {
      setError("Please upload at least one image before continuing.");
      return;
    }
    handleImageChange(images);
    nextStep();
  };

  return (
    <div
      onClick={() => clearStep()}
      className="fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[450px] md:max-h-[90vh] p-6 md:p-8 flex flex-col relative overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={prevStep} className="md:hidden mr-3" type="button">
            <ArrowLeft className="size-6 text-gray-700" />
          </button>
          <h2 className="text-xl md:text-lg font-semibold text-left md:text-center flex-1 md:flex-none">
            Add Photos
          </h2>
        </div>

        {/* Upload box */}
        <div className="flex justify-center">
          <div
            onClick={() => fileInputRef.current.click()}
            className={`border-2 rounded-3xl w-full md:w-60 aspect-square md:h-60 flex items-center justify-center cursor-pointer transition ${images.length >= 6
              ? "border-gray-300 cursor-not-allowed opacity-60"
              : "border-primary/40 hover:border-primary"
              }`}
          >
            <div className="bg-primary/20 rounded-2xl p-6 md:p-4">
              <Plus className="text-white size-12 md:size-16" strokeWidth={3} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={images.length >= 6}
              className="hidden"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-3">{error}</p>
        )}

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-6 w-full grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.url}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleDelete(img.url)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  type="button"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          type="button"
          className="mt-8 mb-20 md:mb-0 bg-primary text-white font-medium w-full py-3 rounded-xl hover:bg-primary/90 transition"
        >
          {loading ? "uploading..." : "Next"}
        </button>
      </div>
    </div>
  );
}
