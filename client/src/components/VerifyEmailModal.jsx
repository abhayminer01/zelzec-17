import React, { useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import { verifyEmail, resendVerificationOtp } from '../services/auth';
import { toast } from 'sonner';

export default function VerifyEmailModal({ email }) {
    const { closeVerifyEmail, openLogin } = useModal();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await verifyEmail(email, otp);
            if (res?.success) {
                toast.success("Email Verified Successfully");
                closeVerifyEmail();
                openLogin();
            } else {
                toast.error(res?.message || "Verification failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const res = await resendVerificationOtp(email);
            if (res?.success) {
                toast.success("OTP Resent Successfully");
            } else {
                toast.error(res?.message || "Failed to resend OTP");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <button
                    onClick={closeVerifyEmail}
                    className="absolute right-5 top-5 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 text-sm">
                        Please enter the OTP sent to <span className="font-semibold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full border border-gray-300 rounded-lg h-12 px-4 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={6}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 font-medium transition disabled:opacity-70"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    Didn't receive code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-primary font-medium hover:underline disabled:opacity-50"
                    >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                </div>
            </div>
        </div>
    );
}
