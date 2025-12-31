// src/components/NavBar.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquareText, Search, UserCircleIcon, LogOut, Settings, User, Package, Heart } from "lucide-react";
import { checkAuth, getUser, logoutUser } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useSell } from '../contexts/SellContext';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';

import { getAllProducts, getListedProducts } from '../services/product-api';
import { getPrimaryCategories } from '../services/category-api';
import Swal from "sweetalert2";
import { toast } from "sonner";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, userData } = useAuth();
  const { openLogin, openRegister, openVerifyEmail } = useModal();
  const { nextStep } = useSell();
  const { toggleSidebar, chatState, loadChats } = useChat();
  const { openSettings } = useSettings();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  useEffect(() => {
    fetchPrimaryCategories();
  }, []);

  const fetchPrimaryCategories = async () => {
    try {
      const res = await getPrimaryCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await getAllProducts({ search: searchQuery, limit: 5 });
        if (res?.success) {
          setSuggestions(res.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (query) => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/catalogue?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    try {
      const res = await checkAuth();
      if (res?.success) {
        const user = await getUser();
        login(user);
        loadChats();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className='w-screen h-16 bg-white  md:h-20 flex justify-center items-center gap-10 px-4 md:px-10 border-b border-border'>
        <div className='md:hidden w-full flex justify-center'>
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-8 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-10 hidden md:block cursor-pointer"
          onClick={() => navigate('/')}
        />

        <div className='relative w-[750px] hidden md:block' ref={searchRef}>
          <input
            type="text"
            placeholder='Search for anything...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            className='w-full bg-white h-10 rounded-lg pl-4 pr-10 border border-border focus:outline-none focus:ring-1 focus:ring-primary transition-all'
          />
          <Search
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-primary transition-colors'
            size={18}
            onClick={() => handleSearch(searchQuery)}
          />

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((product) => (
                    <li
                      key={product._id}
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                    >
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${product.images?.[0]?.url}`}
                        alt={product.title}
                        className="w-8 h-8 rounded object-cover bg-gray-100"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">{product.title}</span>
                        <span className="text-xs text-indigo-600 font-semibold">₹{product.price?.toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                  <li
                    onClick={() => handleSearch(searchQuery)}
                    className="px-4 py-3 bg-gray-50 text-center text-sm text-primary font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    View all results for "{searchQuery}"
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
              )}
            </div>
          )}
        </div>

        <div className='items-center gap-5 hidden md:flex'>
          {isAuthenticated ? (
            <>
              <button
                className={`primarybutton ${isCheckingLimit ? 'opacity-70 cursor-wait' : ''}`}
                disabled={isCheckingLimit}
                onClick={async () => {
                  if (isCheckingLimit) return;
                  if (!userData?.isVerified) {
                    toast.error("Please verify your email to sell products.");
                    openVerifyEmail(userData?.email);
                    return;
                  }
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
                      nextStep();
                    }
                  } catch (error) {
                    console.error("Error checking limits", error);
                    toast.error("Could not verify product limits. Please try again.");
                  } finally {
                    setIsCheckingLimit(false);
                  }
                }}
              >
                {isCheckingLimit ? 'Checking...' : 'Sell'}
              </button>


              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <UserCircleIcon
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className='text-primary size-8 cursor-pointer hover:opacity-80 transition-opacity'
                />

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right ring-1 ring-black/5">
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
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <User size={16} />
                        </div>
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          navigate('/myads');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl flex items-center gap-3 transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Package size={16} />
                        </div>
                        My Ads
                      </button>

                      <button
                        onClick={() => {
                          navigate('/favorites');
                          setIsDropdownOpen(false);
                        }}
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
                          setIsDropdownOpen(false);
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
                          setIsDropdownOpen(false);
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
                  </div>
                )}
              </div>
              <div className="relative" id="nav-message-icon-container">
                <MessageSquareText
                  className="text-primary size-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                  }}
                />
                {(() => {
                  const { chats, currentUserId } = chatState || {};
                  if (!chats || !currentUserId) return null;

                  const totalUnread = chats.reduce((acc, chat) => {
                    const count = (chat.unreadCount && chat.unreadCount[currentUserId]) || 0;
                    return acc + count;
                  }, 0);

                  if (totalUnread === 0) return null;

                  return (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <>
              <button className='secondarybutton' onClick={openLogin}>Sign-In</button>
              <button className='primarybutton' onClick={openRegister}>Register</button>
            </>
          )}
        </div>
      </div>

      {/* Secondary Nav for Categories */}
      <div className="hidden md:flex h-11 justify-center items-center bg-[#F6F1FF] border-b border-[#E9D5FF]/30">
        <div className="flex items-center gap-8">
          {categories.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/category/${item._id}`)}
              className="text-[11px] font-bold text-gray-600 hover:text-[#7C5CB9] uppercase tracking-widest transition-colors cursor-pointer"
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}