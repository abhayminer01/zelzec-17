import React, { useEffect, useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import LoginComponent from './LoginComponent';
import RegisterComponent from './RegisterComponent';
import CompleteProfileModal from './CompleteProfileModal';
import VerifyEmailModal from './VerifyEmailModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function GlobalModals() {
    const { isLoginOpen, isRegisterOpen, isCompleteProfileOpen, openRegister, openCompleteProfile, isVerifyEmailOpen, verificationEmail, isForgotPasswordOpen } = useModal();
    const { userData } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [registerPrefill, setRegisterPrefill] = useState(null);

    useEffect(() => {
        if (userData) {
            // Check if profile is complete (Google Auth users might miss mobile/address)
            if (!userData.mobile || !userData.address) {
                openCompleteProfile();
            }
        }
    }, [userData, openCompleteProfile]);

    useEffect(() => {
        // Handle Google Auth Data passed via URL for Registration (Legacy/Existing flow) if any
        const googleDataParam = searchParams.get('googleData');
        if (googleDataParam) {
            try {
                const data = JSON.parse(decodeURIComponent(googleDataParam));
                setRegisterPrefill(data);
                openRegister();
                setSearchParams((prev) => {
                    const newParams = new URLSearchParams(prev);
                    newParams.delete('googleData');
                    return newParams;
                });
            } catch (e) {
                console.error("Failed to parse google data", e);
            }
        }

        const errorParam = searchParams.get('error');
        if (errorParam === 'account_exists') {
            import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                    icon: 'info',
                    title: 'Account Exists',
                    text: 'You already have an account with this email using a password. Please log in with your password.',
                    confirmButtonColor: '#7C5CB9'
                });
            });
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('error');
                return newParams;
            });
        }
    }, [searchParams, openRegister, setSearchParams]);

    return (
        <>
            {isLoginOpen && <LoginComponent />}
            {isRegisterOpen && <RegisterComponent prefillData={registerPrefill} />}
            {isCompleteProfileOpen && <CompleteProfileModal />}
            {isVerifyEmailOpen && <VerifyEmailModal email={verificationEmail} />}
            {isForgotPasswordOpen && <ForgotPasswordModal />}
        </>
    );
}
