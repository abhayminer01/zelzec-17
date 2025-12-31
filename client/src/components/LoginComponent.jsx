import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useModal } from "../contexts/ModalContext";
import { userLogin, getUser, deleteUser, logoutUser } from "../services/auth";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { X } from "lucide-react";
import Swal from 'sweetalert2';

export default function LoginComponent() {
  const { isLoginOpen, openLogin, closeLogin, openRegister, openForgotPassword } = useModal();
  const { login } = useAuth();

  const handleBackdropClick = (e) => {
    closeLogin();
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await userLogin({ email, password });

    if (res?.success) {
      if (res.restored) {
        const result = await Swal.fire({
          title: 'Account Recovery',
          text: 'Your account was scheduled for deletion. It has been restored. Do you want to keep it or delete it?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Recover',
          cancelButtonText: 'No, Delete it',
          confirmButtonColor: '#8069AE',
          cancelButtonColor: '#EF4444'
        });

        if (result.dismiss === Swal.DismissReason.cancel) {
          // User wants to delete again
          await deleteUser();
          await logoutUser();
          toast.success("Account scheduled for deletion again.");
          closeLogin();
          return;
        }

        toast.success("Account Restored Successfully");
      } else {
        toast.success("User Login", {
          description: "Successfully Logged in",
        });
      }

      const user = await getUser();
      login(user);
      closeLogin();
    } else {
      toast.error("Login Failed", {
        description: res?.message || "Invalid credentials or server error",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto md:w-[380px] p-8 flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
        {/* Heading */}
        <button
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-700 md:hidden p-2"
          onClick={handleBackdropClick}
        >
          <X size={24} />
        </button>
        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-gray-700 text-sm">Welcome to <span className="font-semibold">ZelZec</span></p>
        <p className="text-gray-500 text-sm mb-6">Sign in to Buy and Sell your Stuff!</p>

        {/* Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              name="email"
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <p
            onClick={() => {
              closeLogin();
              openForgotPassword();
            }}
            className="text-right text-sm text-primary cursor-pointer hover:underline"
          >
            Forgot password?
          </p>

          <button
            type="submit"
            className="bg-primary hover:bg-primary text-white rounded-lg h-10 mt-1 font-medium transition"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2">
            <hr className="flex-grow border-gray-300" />
            <span className="text-sm text-gray-500">Or continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary text-white rounded-lg h-10 transition font-medium"
          >
            <FcGoogle />
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{" "}
            <span onClick={() => { closeLogin(); openRegister(); }} className="text-primary font-medium cursor-pointer hover:underline">
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
