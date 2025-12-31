import React, { useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import { sendOtp, verifyOtp, resetPassword } from '../services/auth';
import { toast } from 'sonner';
import { X, Lock, Mail, KeyRound } from 'lucide-react';

export default function ForgotPasswordModal() {
    const { closeForgotPassword, openLogin } = useModal();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await sendOtp(formData.email);
            if (res.success) {
                toast.success('OTP Sent', { description: 'Please check your email for the OTP.' });
                setStep(2);
            } else {
                setError(res.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await verifyOtp(formData.email, formData.otp);
            if (res.success) {
                toast.success('OTP Verified', { description: 'You can now set a new password.' });
                setStep(3);
            } else {
                setError(res.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await resetPassword(formData.email, formData.otp, formData.newPassword);
            if (res.success) {
                toast.success('Password Reset Successful', { description: 'Please login with your new password.' });
                closeForgotPassword();
                openLogin();
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your registered email"
                        required
                        className="w-full border border-gray-300 rounded-lg h-10 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 mt-2 font-medium transition disabled:opacity-70 flex items-center justify-center"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send OTP"}
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-4">
            <div className="text-center mb-2">
                <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to</p>
                <p className="font-medium text-gray-800">{formData.email}</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">OTP</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                        required
                        maxLength={6}
                        className="w-full border border-gray-300 rounded-lg h-10 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary tracking-widest"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 mt-2 font-medium transition disabled:opacity-70 flex items-center justify-center"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Verify OTP"}
            </button>
            <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 underline text-center"
            >
                Wrong email? Go back
            </button>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Create new password"
                        required
                        className="w-full border border-gray-300 rounded-lg h-10 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                        className="w-full border border-gray-300 rounded-lg h-10 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 mt-2 font-medium transition disabled:opacity-70 flex items-center justify-center"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Reset Password"}
            </button>
        </form>
    );

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={closeForgotPassword}
        >
            <div
                className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto md:w-[400px] p-8 flex flex-col items-center relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={closeForgotPassword}
                    className="absolute right-5 top-5 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 1 && "Enter your email to receive a verification code"}
                        {step === 2 && "Verify your identity"}
                        {step === 3 && "Secure your account"}
                    </p>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
}
