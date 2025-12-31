import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);

    const openCompleteProfile = () => setIsCompleteProfileOpen(true);
    const closeCompleteProfile = () => setIsCompleteProfileOpen(false);

    const [isVerifyEmailOpen, setIsVerifyEmailOpen] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");
    const openVerifyEmail = (email) => {
        if (email) setVerificationEmail(email);
        setIsVerifyEmailOpen(true);
    }
    const closeVerifyEmail = () => setIsVerifyEmailOpen(false);

    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const openForgotPassword = () => setIsForgotPasswordOpen(true);
    const closeForgotPassword = () => setIsForgotPasswordOpen(false);

    const openLogin = () => setIsLoginOpen(true);
    const closeLogin = () => setIsLoginOpen(false);

    const openRegister = () => setIsRegisterOpen(true);
    const closeRegister = () => setIsRegisterOpen(false);

    return (
        <ModalContext.Provider value={{
            isLoginOpen,
            isRegisterOpen,
            openLogin,
            closeLogin,
            openRegister,
            closeRegister,
            isCompleteProfileOpen,
            openCompleteProfile,
            closeCompleteProfile,
            isVerifyEmailOpen,
            openVerifyEmail,
            closeVerifyEmail,
            closeVerifyEmail,
            verificationEmail,
            isForgotPasswordOpen,
            openForgotPassword,
            closeForgotPassword
        }
        }>
            {children}
        </ModalContext.Provider>
    )
}

export const useModal = () => useContext(ModalContext);