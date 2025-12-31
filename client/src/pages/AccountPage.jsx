import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';
import { getUser, updateUser, deleteUser, logoutUser, sendOtp, verifyOtp, resetPassword } from '../services/auth';
import { toast, Toaster } from 'sonner';
import { User, Mail, Phone, MapPin, Save, Edit2, X, Shield, Camera, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AccountPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { openVerifyEmail } = useModal();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile: '',
        address: '',
        location: { lat: '', lng: '' }
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal'); // personal, security, notifications

    // Password Update State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: New Password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getUser();
                setUser(userData);
                setFormData({
                    full_name: userData?.full_name || '',
                    email: userData?.email || '',
                    mobile: userData?.mobile || '',
                    address: userData?.address || '',
                    location: userData?.location || { lat: '', lng: '' }
                });
            } catch (error) {
                toast.error('Failed to load account data');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'lat' || name === 'lng') {
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            const res = await updateUser({
                full_name: formData.full_name,
                mobile: formData.mobile,
                address: formData.address,
                location: formData.location
            });

            if (res.success) {
                setUser(res.data);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            } else {
                toast.error(res.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred while updating profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            email: user?.email || '',
            mobile: user?.mobile || '',
            address: user?.address || '',
            location: user?.location || { lat: '', lng: '' }
        });
        setIsEditing(false);
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Delete Account?',
            text: "Your account will be scheduled for deletion. You can restore it by logging in within 15 days. After 15 days, it will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteUser();
                if (res.success) {
                    await Swal.fire(
                        'Scheduled!',
                        'Your account has been scheduled for deletion.',
                        'success'
                    );
                    await logoutUser();
                    logout();
                    navigate('/');
                } else {
                    toast.error(res.message || 'Failed to delete account');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred while deleting account');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8069AE] border-t-transparent"></div>
                </div>
                <MobileBottomNav />
            </div>
        );
    }


    // Password Update Handlers
    const handleSendOtp = async () => {
        setPasswordLoading(true);
        try {
            const res = await sendOtp(user.email);
            if (res.success) {
                toast.success('OTP sent to your email');
                setPasswordStep(2);
            } else {
                toast.error(res.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Error sending OTP');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setPasswordLoading(true);
        try {
            const res = await verifyOtp(user.email, otp);
            if (res.success) {
                toast.success('OTP verified');
                setPasswordStep(3);
            } else {
                toast.error(res.message || 'Invalid OTP');
            }
        } catch (error) {
            toast.error('Error verifying OTP');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await resetPassword(user.email, otp, newPassword);
            if (res.success) {
                toast.success('Password updated successfully');
                setShowPasswordModal(false);
                resetPasswordState();
            } else {
                toast.error(res.message || 'Failed to update password');
            }
        } catch (error) {
            toast.error('Error updating password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const resetPasswordState = () => {
        setPasswordStep(1);
        setOtp('');
        setNewPassword('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Toaster position="top-right" richColors />
            <NavBar />

            <main className="flex-1 pb-20 md:pb-8">
                {/* Banner Section */}
                <div className="h-48 bg-gradient-to-r from-[#604D85] to-[#8069AE] w-full relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* Left Sidebar: Profile Card & Navigation */}
                        <div className="w-full md:w-80 flex flex-col gap-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden text-center group hover:shadow-xl transition-shadow">
                                {/* Card Header Gradient */}
                                <div className="h-32 bg-gradient-to-r from-[#604D85] to-[#8069AE] relative">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>

                                <div className="px-6 pb-6 relative">
                                    {/* Avatar */}
                                    <div className="relative inline-block -mt-16 mb-4">
                                        <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                                            <div className="w-full h-full rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#8069AE] text-5xl font-bold border-4 border-white">
                                                {user?.full_name?.charAt(0)?.toUpperCase() || <User size={48} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.full_name || 'User'}</h2>
                                    <p className="text-gray-500 font-medium mb-6">{user?.email || 'No email'}</p>

                                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 mx-auto w-fit">
                                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                                            {user?.isVerified ? (
                                                <ShieldCheck size={14} className="text-green-500" />
                                            ) : (
                                                <Shield size={14} className="text-red-500" />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${user?.isVerified ? 'text-green-600' : 'text-red-500'}`}>
                                            {user?.isVerified ? 'Verified Member' : 'Unverified'}
                                        </span>
                                    </div>
                                    {!user?.isVerified && (
                                        <button
                                            onClick={() => openVerifyEmail(user?.email)}
                                            className="mt-3 text-xs text-primary underline hover:text-primary/80"
                                        >
                                            Verify Email Now
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible no-scrollbar">
                                    <button
                                        onClick={() => setActiveTab('personal')}
                                        className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-b-4 md:border-b-0 md:border-l-4 whitespace-nowrap ${activeTab === 'personal' ? 'bg-[#8069AE]/10 text-primary border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'}`}
                                    >
                                        <User size={18} />
                                        Personal Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-b-4 md:border-b-0 md:border-l-4 whitespace-nowrap ${activeTab === 'security' ? 'bg-[#8069AE]/10 text-primary border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'}`}
                                    >
                                        <Shield size={18} />
                                        Login & Security
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">
                                            {activeTab === 'personal' && 'Personal Information'}
                                            {activeTab === 'security' && 'Login & Security'}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {activeTab === 'personal' && 'Manage your personal details and public profile.'}
                                            {activeTab === 'security' && 'Manage your password and account security settings.'}
                                        </p>
                                    </div>
                                    {activeTab === 'personal' && (
                                        !isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#8069AE] text-white text-sm font-medium rounded-lg hover:bg-[#6A5299] transition-all shadow-sm active:scale-95"
                                            >
                                                <Edit2 size={16} />
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#8069AE] text-white text-sm font-medium rounded-lg hover:bg-[#6A5299] transition-colors shadow-sm"
                                                >
                                                    <Save size={16} />
                                                    Save Changes
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Content Body */}
                                <div className="p-8">
                                    {activeTab === 'personal' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <User className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="full_name"
                                                            value={formData.full_name}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-primary focus:border-primary bg-white' : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'} transition-colors`}
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Mail className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            disabled={true}
                                                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border border-transparent bg-gray-100 text-gray-500 cursor-not-allowed opacity-75"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Phone className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            name="mobile"
                                                            value={formData.mobile}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-primary focus:border-primary bg-white' : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'} transition-colors`}
                                                            placeholder="+1 (555) 000-0000"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <MapPin className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-primary focus:border-primary bg-white' : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'} transition-colors`}
                                                            placeholder="123 Main St, City, Country"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="space-y-8">
                                            <div className="text-center py-8 border-b border-gray-100">
                                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Shield className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                                                <p className="text-gray-500 mt-1">Manage your account security.</p>

                                                {user?.googleId ? (
                                                    <div className="mt-6 flex flex-col items-center gap-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                        <div className="flex items-center gap-2 text-blue-700 font-medium">
                                                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                                <svg viewBox="0 0 24 24" className="w-3 h-3">
                                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                    <path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                                </svg>
                                                            </div>
                                                            Signed in with Google
                                                        </div>
                                                        <p className="text-blue-600/80 text-sm">
                                                            Your password is managed by Google. You cannot change it here.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowPasswordModal(true)}
                                                        className="mt-6 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Update Password
                                                    </button>
                                                )}
                                            </div>

                                            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                                <h3 className="text-lg font-bold text-red-700 mb-2">Delete Account</h3>
                                                <p className="text-red-600/80 text-sm mb-6">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                </p>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Password Update Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => { setShowPasswordModal(false); resetPasswordState(); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-6">Update Password</h3>

                        {passwordStep === 1 && (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Click the button below to receive a One-Time Password (OTP) on your registered email: <strong>{user?.email}</strong>
                                </p>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={passwordLoading}
                                    className="w-full bg-[#8069AE] text-white py-3 rounded-xl font-medium hover:bg-[#6A5299] transition-colors disabled:opacity-70"
                                >
                                    {passwordLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        )}

                        {passwordStep === 2 && (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Enter the OTP sent to <strong>{user?.email}</strong>
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#8069AE] focus:border-transparent outline-none text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={passwordLoading || otp.length !== 6}
                                    className="w-full bg-[#8069AE] text-white py-3 rounded-xl font-medium hover:bg-[#6A5299] transition-colors disabled:opacity-70"
                                >
                                    {passwordLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    onClick={() => setPasswordStep(1)}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        )}

                        {passwordStep === 3 && (
                            <div className="space-y-4">
                                <p className="text-gray-600">Enter your new password.</p>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#8069AE] focus:border-transparent outline-none"
                                />
                                <button
                                    onClick={handleResetPassword}
                                    disabled={passwordLoading || !newPassword}
                                    className="w-full bg-[#8069AE] text-white py-3 rounded-xl font-medium hover:bg-[#6A5299] transition-colors disabled:opacity-70"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
