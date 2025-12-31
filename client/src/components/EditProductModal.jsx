import React, { useEffect, useState, useRef } from "react";
import { getCategoryForm } from "../services/category-api";
import { updateProduct } from "../services/product-api";
import { X, ArrowLeft, Plus, MapPin, Image as ImageIcon } from "lucide-react"; // Renamed Image to ImageIcon to avoid conflict
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import imageCompression from "browser-image-compression";

// --- Leaflet Configuration ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// --- Helper Components & Functions ---
function extractPlaceName(data) {
    if (!data) return "";
    let name = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.state_district || data.address?.state || "";
    if (!name && data.display_name) name = data.display_name.split(",")[0].trim();
    name = name.replace(/[^\x00-\x7F]/g, "").trim();
    return name;
}

function LocationMarker({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 16);
    }, [position, map]);
    return position ? <Marker position={position} /> : null;
}

function ClickableMap({ setMarkerPos, onLocationSelect }) {
    const map = useMap();
    useEffect(() => {
        const handleClick = async (e) => {
            const lat = Number(e.latlng.lat.toFixed(5));
            const lng = Number(e.latlng.lng.toFixed(5));
            setMarkerPos([lat, lng]);

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                const placeName = extractPlaceName(data) || `${lat}, ${lng}`;
                onLocationSelect({ lat, lng, place: placeName }, placeName);
            } catch (err) {
                console.error("Error fetching address:", err);
            }
        };
        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [map, setMarkerPos, onLocationSelect]);
    return null;
}

// --- Main Component ---
export default function EditProductModal({ product, onClose, onUpdate }) {
    const [view, setView] = useState("MAIN"); // MAIN, LOCATION, IMAGES
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState(product?.title || "");
    const [description, setDescription] = useState(product?.description || "");
    const [price, setPrice] = useState(product?.price || "");
    const [formData, setFormData] = useState(product?.form_data || {});

    // Location State
    const [location, setLocation] = useState(product?.location || null);
    const [tempLocationAddress, setTempLocationAddress] = useState(product?.location?.place || "");
    const [markerPos, setMarkerPos] = useState(product?.location ? [product.location.lat, product.location.lng] : null);

    // Image State
    // Normalize initial images: ensure they have { url } structure and valid absolute URL
    const initialImages = (product?.images || []).map(img => {
        let url = typeof img === 'string' ? img : img.url;
        if (url && url.startsWith('/')) {
            url = `${import.meta.env.VITE_BACKEND_URL}${url}`;
        }
        return { url, file: null }; // explicitly set file: null for existing images
    });
    const [images, setImages] = useState(initialImages); // Array of { url, file? }
    const fileInputRef = useRef(null);
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        fetchCategoryForm();
    }, [product?.category]);

    const fetchCategoryForm = async () => {
        try {
            if (!product?.category?._id) return;
            const categoryId = product.category._id || product.category;
            const req = await getCategoryForm(categoryId);
            if (req.success) {
                setSchema(req.data.form_data || []);
            }
        } catch (err) {
            console.error("Error fetching category form:", err);
            toast.error("Failed to load form definitions");
        } finally {
            setLoading(false);
        }
    };

    const handleFormDataChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Handlers for Location Search ---
    const handleLocationSearch = async () => {
        if (!tempLocationAddress) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&accept-language=en&q=${encodeURIComponent(tempLocationAddress)}`);
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const position = [parseFloat(lat), parseFloat(lon)];
                setMarkerPos(position);
                const placeName = display_name.split(",")[0].trim();
                setTempLocationAddress(placeName);
                setLocation({ lat: parseFloat(lat), lng: parseFloat(lon), place: placeName });
            } else {
                toast.error("Location not found");
            }
        } catch (err) {
            console.error("Error searching location:", err);
        }
    };

    // --- Handlers for Image Upload ---
    const handleFileChange = async (e) => {
        setImageError("");
        const files = Array.from(e.target.files);

        const remainingSlots = 6 - images.length;
        if (remainingSlots <= 0) {
            setImageError("You have reached the limit of 6 images.");
            return;
        }

        let filesToProcess = files;
        if (files.length > remainingSlots) {
            filesToProcess = files.slice(0, remainingSlots);
            setImageError(`Only ${remainingSlots} image(s) could be added. Limit is 6.`);
        }

        try {
            const compressedPreviews = await Promise.all(
                filesToProcess.map(async (file) => {
                    const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1080, useWebWorker: true };
                    const compressedFile = await imageCompression(file, options);
                    return {
                        file: compressedFile,
                        url: URL.createObjectURL(compressedFile),
                    };
                })
            );
            setImages([...images, ...compressedPreviews]);
        } catch (err) {
            console.error("Error compressing images:", err);
            setImageError("Error processing images.");
        }
    };

    const handleDeleteImage = (url) => {
        setImages(prev => prev.filter(img => img.url !== url));
    };


    // --- Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = new FormData();
        payload.append("title", title);
        payload.append("description", description);
        payload.append("price", price);
        payload.append("form_data", JSON.stringify(formData));

        if (location) {
            payload.append("location", JSON.stringify(location));
        }

        // Separate existing images from new files
        const existingImages = images.filter(img => !img.file).map(img => {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (img.url.startsWith(backendUrl)) {
                return img.url.replace(backendUrl, "");
            }
            return img.url;
        });
        const newFiles = images.filter(img => img.file).map(img => img.file);

        payload.append("existing_images", JSON.stringify(existingImages));
        newFiles.forEach(file => {
            payload.append("images", file);
        });

        const res = await updateProduct(product._id, payload);

        setSubmitting(false);

        if (res.success) {
            toast.success("Product updated successfully");
            onUpdate();
            onClose();
        } else {
            toast.error(res.message || "Failed to update product");
        }
    };

    // --- Render Views ---
    const renderHeader = (title, onBack) => (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                )}
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
            </button>
        </div>
    );

    const renderMainView = () => (
        <>
            {renderHeader("Edit Product")}
            <div className="p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <form id="edit-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Basic Fields */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-2 text-sm">Ad Title <span className="text-red-500">*</span></label>
                            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-medium mb-2 text-sm">Price <span className="text-red-500">*</span></label>
                            <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>

                        {/* Dynamic Fields */}
                        {schema.map((field) => (
                            <div key={field._id} className="flex flex-col">
                                <label className="font-medium mb-2 text-sm">{field.title} <span className="text-red-500 ml-1">*</span></label>
                                {field.type === "select" ? (
                                    <select required name={field.label} value={formData[field.label] || ""} onChange={handleFormDataChange} className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary">
                                        <option value="" disabled>Select {field.title}</option>
                                        {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input required type={field.type || "text"} name={field.label} value={formData[field.label] || ""} placeholder={field.title} onChange={handleFormDataChange} className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary" />
                                )}
                            </div>
                        ))}

                        <div className="flex flex-col">
                            <label className="font-medium mb-2 text-sm">Description <span className="text-red-500">*</span></label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                    </form>
                )}

                {/* Navigational Buttons for Location & Images */}
                <div className="mt-6 flex flex-col gap-3">
                    <button type="button" onClick={() => setView("LOCATION")} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><MapPin size={20} /></div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Location</h4>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{location?.place || "Set location"}</p>
                            </div>
                        </div>
                        <ArrowLeft size={16} className="rotate-180 text-gray-400" />
                    </button>

                    <button type="button" onClick={() => setView("IMAGES")} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors"><ImageIcon size={20} /></div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Images</h4>
                                <p className="text-sm text-gray-500">{images.length} images selected</p>
                            </div>
                        </div>
                        <ArrowLeft size={16} className="rotate-180 text-gray-400" />
                    </button>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" form="edit-form" disabled={submitting || loading} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderLocationView = () => (
        <>
            {renderHeader("Edit Location", () => setView("MAIN"))}
            <div className="p-6 flex-1 flex flex-col min-h-0">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search city..."
                        value={tempLocationAddress}
                        onChange={(e) => setTempLocationAddress(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                        className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={handleLocationSearch} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">Search</button>
                </div>
                <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 relative">
                    <MapContainer center={markerPos || [20.5937, 78.9629]} zoom={product?.location ? 13 : 5} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker position={markerPos} />
                        <ClickableMap
                            setMarkerPos={setMarkerPos}
                            onLocationSelect={(locObj, placeName) => {
                                setLocation(locObj);
                                setTempLocationAddress(placeName);
                            }}
                        />
                    </MapContainer>
                </div>
                <button onClick={() => setView("MAIN")} className="w-full py-3 bg-primary text-white rounded-xl mt-4 font-medium hover:bg-primary/90">Confirm Location</button>
            </div>
        </>
    );

    const renderImagesView = () => (
        <>
            {renderHeader("Edit Images", () => setView("MAIN"))}
            <div className="p-6 overflow-y-auto">
                <div className="flex justify-center mb-6">
                    <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-3xl w-full max-w-[200px] aspect-square flex flex-col items-center justify-center cursor-pointer transition ${images.length >= 6 ? "border-gray-300 opacity-50 cursor-not-allowed" : "border-primary/40 hover:border-primary hover:bg-primary/5"}`}>
                        <div className="bg-primary/10 rounded-full p-4 mb-2"><Plus className="text-primary size-8" strokeWidth={3} /></div>
                        <span className="text-sm font-medium text-gray-600">Add Photo</span>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} disabled={images.length >= 6} className="hidden" />
                    </div>
                </div>

                {imageError && <p className="text-red-500 text-sm text-center mb-4">{imageError}</p>}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                            <img src={img.url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                            <button onClick={() => handleDeleteImage(img.url)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={() => setView("MAIN")} className="w-full py-3 bg-primary text-white rounded-xl mt-8 font-medium hover:bg-primary/90">Done</button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {view === "MAIN" && renderMainView()}
                {view === "LOCATION" && renderLocationView()}
                {view === "IMAGES" && renderImagesView()}
            </div>
        </div>
    );
}
