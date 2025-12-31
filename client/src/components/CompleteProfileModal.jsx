import React, { useState, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { updateUser, getUser } from "../services/auth";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function CompleteProfileModal() {
    const { closeCompleteProfile } = useModal();
    const { login, userData } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        mobile: "",
        addressHouse: "",
        addressStreet: "",
        addressCity: "",
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                email: userData.email || "",
                fullName: userData.full_name || "",
                mobile: userData.mobile ? userData.mobile.toString().replace('+91', '') : "", // remove +91 if present for editing
                addressHouse: "", // user needs to fill this if it was old format
                addressStreet: "",
                addressCity: "",
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            return toast.error("Please enter a valid Indian mobile number");
        }

        if (formData.addressHouse.trim() === "" || formData.addressStreet.trim() === "" || formData.addressCity.trim() === "") {
            return toast.error("All address fields are required");
        }

        setLoading(true);

        let location = null;
        if (navigator.geolocation) {
            try {
                location = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) =>
                            resolve({
                                lat: parseFloat(position.coords.latitude.toFixed(6)),
                                lng: parseFloat(position.coords.longitude.toFixed(6)),
                            }),
                        () => resolve(null) // fallback if user denies
                    );
                });
            } catch (err) {
                location = null;
            }
        }

        if (!location) {
            // Optional: Could choose to block compliance if location is strict requirement
            // For now, mirroring RegisterComponent logic which mandates location
            setLoading(false);
            return toast.error("Please allow location access to complete registration");
        }

        // Payload
        const payload = {
            full_name: formData.fullName, // included but typically unchanged
            mobile: `+91${formData.mobile}`,
            address: `${formData.addressHouse}, ${formData.addressStreet}, ${formData.addressCity}`,
            location,
        };

        try {
            const res = await updateUser(payload);
            if (res?.success) {
                toast.success("Profile Updated", { description: "You are all set!" });
                const user = await getUser();
                login(user); // Update context with new data
                closeCompleteProfile();
            } else {
                toast.error("Update Failed", {
                    description: `${res?.message || res?.err}`,
                });
            }
        } catch (err) {
            toast.error("Something went wrong", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        // Prevent closing by clicking outside to force completion
        >
            <div
                className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto md:w-[450px] p-6 md:p-8 flex flex-col items-center relative overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-2xl font-bold mb-1">Complete Profile</h1>
                <p className="text-gray-700 text-sm">
                    Welcome to <span className="font-semibold">ZelZec</span>
                </p>
                <p className="text-gray-500 text-[12px] mb-6">
                    Please provide your details to continue.
                </p>

                <form className="w-full flex flex-col gap-4" onSubmit={handleFormSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full border border-gray-300 rounded-lg h-10 px-3 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            disabled
                            className="w-full border border-gray-300 rounded-lg h-10 px-3 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Mobile Number <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                +91
                            </span>
                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter 10-digit mobile number"
                                required
                                maxLength={10}
                                className="w-full border border-gray-300 rounded-r-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium">
                            Address <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="addressHouse"
                                value={formData.addressHouse}
                                onChange={handleChange}
                                placeholder="House/Building No."
                                required
                                className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <input
                                type="text"
                                name="addressCity"
                                value={formData.addressCity}
                                onChange={handleChange}
                                placeholder="City/Place"
                                required
                                className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <input
                            type="text"
                            name="addressStreet"
                            value={formData.addressStreet}
                            onChange={handleChange}
                            placeholder="Street/Area Name"
                            required
                            className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 mt-1 font-medium transition disabled:bg-primary/70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                        {loading ? "Saving..." : "Save & Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}
