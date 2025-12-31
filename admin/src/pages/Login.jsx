import React from "react";
import { loginUser } from "../services/auth";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleForm = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!email || !password)
      return toast.error("Please fill in all fields");

    const res = await loginUser({ email, password });

    if (res.success) {
      toast.success("ZelZec Admin Panel", {
        description: "Successfully Logged In",
      });
      navigate("/dashboard");
    } else {
      toast.error("ZelZec Admin Panel", {
        description: res.message || res.err || "Something went wrong",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Building2 size={36} />
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              ZelZec Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Login to access your admin dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleForm} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              className="w-full border border-gray-300 focus:border-primary focus:ring-primary rounded-lg px-3 py-2 outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 focus:border-primary focus:ring-primary rounded-lg px-3 py-2 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-500/90 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} ZelZec Admin Panel
        </p>
      </div>
    </div>
  );
}
