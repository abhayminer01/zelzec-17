import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Plus, MessageCircle, Menu, User, Settings, LogOut, UserCircle2, Package, Heart } from 'lucide-react'; // Added icons
import { useSell } from '../contexts/SellContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Added
import { useSettings } from '../contexts/SettingsContext'; // Added
import { useModal } from '../contexts/ModalContext'; // Added
import { logoutUser } from '../services/auth'; // Added
import { getListedProducts } from '../services/product-api'; // Added
import Swal from "sweetalert2";
import { toast } from "sonner";

export default function MobileBottomNav() {
  const { nextStep } = useSell();
  const { toggleSidebar, closeSidebar } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  // Auth & Settings hooks
  const { isAuthenticated, logout, userData } = useAuth();
  const { openSettings } = useSettings();
  const { openLogin, openRegister } = useModal();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!toggleRef.current || !toggleRef.current.contains(event.target))
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close chat and navigate
  const navigateAndCloseChat = (path) => {
    closeSidebar();
    setIsMenuOpen(false); // Close menu if open
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/product')) return 'message';
    if (location.pathname === '/search') return 'search';
    if (location.pathname === '/profile') return 'menu';
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Menu "Dropup" */}
      {isMenuOpen && (
        <div ref={menuRef} className="fixed bottom-20 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 origin-bottom-right ring-1 ring-black/5">
          {isAuthenticated ? (
            <>
              {/* User Header */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{userData?.full_name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500 truncate font-medium">{userData?.email || 'Please sign in'}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-2 py-2 space-y-1">
                <button
                  onClick={() => navigateAndCloseChat('/profile')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <User size={16} />
                  </div>
                  Profile
                </button>

                <button
                  onClick={() => navigateAndCloseChat('/myads')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Package size={16} />
                  </div>
                  My Ads
                </button>

                <button
                  onClick={() => navigateAndCloseChat('/favorites')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Heart size={16} />
                  </div>
                  Favorites
                </button>

                <button
                  onClick={() => {
                    openSettings();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Settings size={16} />
                  </div>
                  Settings
                </button>
              </div>

              {/* Footer */}
              <div className="px-2 pt-1 pb-1 border-t border-gray-100 mt-1">
                <button
                  onClick={async () => {
                    await logoutUser();
                    logout();
                    setIsMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                    <LogOut size={16} />
                  </div>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col justify-center items-center text-center px-6 -mt-10">
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                  <UserCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ZelZec</h3>
                <p className="text-gray-500 mb-8 max-w-[250px] leading-relaxed">
                  Sign in to post ads, chat with sellers, and manage your profile.
                </p>

                <div className="w-full space-y-3">
                  <button className='primarybutton w-full justify-center h-12 text-base shadow-lg shadow-primary/20' onClick={() => { openLogin(); setIsMenuOpen(false); }}>
                    Sign In
                  </button>
                  <button className='w-full h-12 text-base font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200' onClick={() => { openRegister(); setIsMenuOpen(false); }}>
                    Create an account
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500">
                    </div>
                    <span>Sell Fast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500">
                    </div>
                    <span>Buy Smart</span>
                  </div>
                </div>
              </div>
            </div>
          )}    </div>
      )}

      <div className='fixed bottom-0 left-0 w-full h-16 bg-white border-t border-border flex justify-around items-center md:hidden z-40 safe-area-bottom'>
        {/* Home */}
        <button
          onClick={() => navigateAndCloseChat('/')}
          className='flex flex-col items-center justify-center flex-1'
        >
          <Home
            className={`size-6 ${activeTab === 'home' ? 'text-primary' : 'text-gray-600'}`}
          />
        </button>

        {/* Search */}
        <button
          onClick={() => navigateAndCloseChat('/search')}
          className='flex flex-col items-center justify-center flex-1'
        >
          <Search
            className={`size-6 ${activeTab === 'search' ? 'text-primary' : 'text-gray-600'}`}
          />
        </button>

        {/* Sell / Post Ad */}
        <button
          onClick={async () => {
            // If already checking, do nothing (prevent double clicks)
            if (isCheckingLimit) return;

            closeSidebar();
            setIsMenuOpen(false);
            if (!isAuthenticated) {
              openLogin();
              return;
            }

            // Check Limit
            setIsCheckingLimit(true);
            try {
              const res = await getListedProducts();
              if (res.success && res.data.length >= 8) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Limit Reached',
                  text: "You have reached the maximum limit of 8 products.",
                  confirmButtonColor: '#7C5CB9'
                });
              } else {
                setTimeout(() => nextStep(), 100);
              }
            } catch (error) {
              console.error("Error checking limits", error);
              // Fallback to allow listing if check fails? Or block? 
              // Sticking to safer side (allow) or alerting error.
              // Let's alert error for now.
              toast.error("Could not verify product limits. Please try again.");
            } finally {
              setIsCheckingLimit(false);
            }
          }}
          className='flex flex-col items-center justify-center flex-1'
          disabled={isCheckingLimit}
        >
          <div className={`bg-black rounded-lg p-2 shadow-lg shadow-black/20 ${isCheckingLimit ? 'opacity-70' : ''}`}>
            {isCheckingLimit ? (
              <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Plus className='text-white size-6' />
            )}
          </div>
        </button>

        {/* Messages */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              openLogin();
              return;
            }
            toggleSidebar();
            setIsMenuOpen(false);
          }}
          className='flex flex-col items-center justify-center flex-1'
        >
          <MessageCircle
            className={`size-6 ${activeTab === 'message' ? 'text-primary' : 'text-gray-600'}`}
          />
        </button>

        {/* Menu Toggle */}
        <button
          ref={toggleRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='flex flex-col items-center justify-center flex-1'
        >
          {isAuthenticated && userData?.full_name ? (
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${activeTab === 'menu' || isMenuOpen ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-gray-100 text-gray-600'}`}>
              {userData.full_name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <UserCircle2
              className={`size-7 ${activeTab === 'menu' || isMenuOpen ? 'text-primary' : 'text-gray-600'}`}
            />
          )}
        </button>
      </div>
    </>
  );
}