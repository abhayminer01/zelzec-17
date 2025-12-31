import React, { useState } from "react";
import { useModal } from "../contexts/ModalContext";
import { registerUser, getUser } from "../services/auth";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterComponent({ prefillData }) {
  const { closeRegister, openLogin, openVerifyEmail } = useModal();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: prefillData?.email || "",
    password: "",
    repeatPassword: "",
    fullName: prefillData?.full_name || "",
    mobile: "",
    addressHouse: "",
    addressStreet: "",
    addressCity: "",
    googleId: prefillData?.googleId || null
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.email.includes("@")) {
      return toast.error("Please enter a valid email");
    }

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (formData.password !== formData.repeatPassword) {
      return toast.error("Passwords do not match");
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      return toast.error("Please enter a valid Indian mobile number");
    }

    if (formData.fullName.trim() === "") {
      return toast.error("Full name is required");
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
      setLoading(false);
      return toast.error("Please allow location access to register");
    }

    // Payload
    const payload = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      mobile: `+91${formData.mobile}`,
      address: `${formData.addressHouse}, ${formData.addressStreet}, ${formData.addressCity}`,
      location,
      googleId: formData.googleId
    };

    try {
      const res = await registerUser(payload);
      if (res?.success) {
        if (res.verificationRequired) {
          toast.success("Registration Successful", { description: "Please verify your email" });
          closeRegister();
          // Assuming openVerifyEmail is available from useModal, need to update the destructuring below
          openVerifyEmail(payload.email);
        } else {
          toast.success("User Registration", { description: "Successfully Registered User" });
          const user = await getUser();
          login(user);
          closeRegister();
        }
      } else {
        toast.error("Registration Failed", {
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
      onClick={closeRegister}
    >
      <div
        className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto md:w-[450px] p-6 md:p-8 flex flex-col items-center relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeRegister}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-700 md:hidden p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h1 className="text-2xl font-bold mb-1">Sign Up</h1>
        <p className="text-gray-700 text-sm">
          Welcome to <span className="font-semibold">ZelZec</span>
        </p>
        <p className="text-gray-500 text-[12px] mb-6">
          Create an account to Buy and Sell your Stuff!
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Repeat Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
            {loading ? "Registering..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => {
                closeRegister();
                openLogin();
              }}
              className="text-primary font-medium cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
