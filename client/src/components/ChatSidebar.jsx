// src/components/ChatSidebar.jsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import MobileBottomNav from './MobileBottomNav';

const ChatSidebar = () => {
    const { chatState, closeChat, closeSidebar, setActiveChat } = useChat();
    const { isSidebarOpen, chats, currentUserId } = chatState;

    const [search, setSearch] = useState('');
    const [position, setPosition] = useState({ top: 70, right: 120 }); // Defaults

    // Calculate position
    useLayoutEffect(() => {
        if (isSidebarOpen) {
            const updatePosition = () => {
                const iconElement = document.getElementById('nav-message-icon-container');
                if (iconElement) {
                    const rect = iconElement.getBoundingClientRect();
                    const iconCenterX = rect.left + rect.width / 2;

                    // Notch is at right-6 (24px) + half width (8px) = 32px from right edge
                    // We want: WindowWidth - SidebarRightCSS - 32 = IconCenterX
                    // SidebarRightCSS = WindowWidth - IconCenterX - 32

                    const calculatedRight = window.innerWidth - iconCenterX - 32;
                    // Add a small vertical gap (e.g. 16px) below the icon
                    const calculatedTop = rect.bottom + 12;

                    setPosition({
                        top: calculatedTop,
                        right: Math.max(10, calculatedRight) // Keep at least 10px from edge
                    });
                }
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [isSidebarOpen]);

    // Close sidebar on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isSidebarOpen) {
                closeSidebar();
            }
        };

        if (isSidebarOpen) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isSidebarOpen, closeSidebar]);

    if (!isSidebarOpen) return null;

    const filteredChats = chats.filter(chat => {
        const otherUser = chat.buyer?._id === currentUserId ? chat.seller : chat.buyer;
        const partnerName = otherUser?.full_name?.trim() || 'User';
        const productTitle = chat.product?.title || '';
        const lastMessage = chat.lastMessage || '';

        const lowerSearch = search.toLowerCase();

        return partnerName.toLowerCase().includes(lowerSearch) ||
            productTitle.toLowerCase().includes(lowerSearch) ||
            lastMessage.toLowerCase().includes(lowerSearch);
    });

    return (
        <>
            {/* Desktop Version (md and up) */}
            <div
                className="fixed inset-0 z-[50] hidden md:block" // Fixed overlay to capture clicks
                onClick={closeSidebar}
            >
                <div
                    className="absolute w-[350px] bg-[#F3F0FA] rounded-lg shadow-xl border border-[#E6E0F5] pointer-events-auto transform transition-all duration-200 ease-in-out"
                    style={{
                        top: `${position.top}px`,
                        right: `${position.right}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Callout Arrow */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-[#F3F0FA] border-t border-l border-[#E6E0F5] transform rotate-45"></div>

                    <div className="p-4 pt-6 pb-3 border-b border-[#E6E0F5]">
                        <h2 className="text-xl font-semibold text-[#7C5CB9]">Chats</h2>
                        <div className="mt-3 relative">
                            <input
                                type="text"
                                placeholder="Search Message..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white h-10 rounded-lg pl-4 pr-10 border border-[#E6E0F5] focus:outline-none focus:ring-1 focus:ring-[#C8B6E2]"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89BC8]" size={18} />
                        </div>
                    </div>

                    <div className="h-[300px] overflow-y-auto overflow-x-hidden p-3 space-y-2">
                        {filteredChats.length === 0 ? (
                            <p className="text-center text-[#A89BC8] text-sm py-4">No chats found</p>
                        ) : (
                            filteredChats.map(chat => {
                                const otherUser = chat.buyer?._id === currentUserId ? chat.seller : chat.buyer;
                                const partnerName = otherUser?.full_name?.trim() || 'User';
                                const partnerAvatar = otherUser?.avatar;
                                const preview = chat.lastMessage || 'No messages yet';
                                const time = new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                // Check unread
                                const unreadCount = (chat.unreadCount && chat.unreadCount[currentUserId]) || 0;
                                const isUnread = unreadCount > 0;

                                return (
                                    <div
                                        key={chat._id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isUnread ? 'bg-white border-l-4 border-[#7C5CB9] shadow-sm' : 'hover:bg-[#EFEAF9]'}`}
                                        onClick={() => {
                                            setActiveChat(chat);
                                        }}
                                    >
                                        <img
                                            src={partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=8069AE&color=fff`}
                                            alt={partnerName}
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-medium text-[#7C5CB9] truncate ${isUnread ? 'font-bold' : ''}`}>{partnerName}</h3>
                                                    {chat.product && (
                                                        <p className="text-xs text-gray-500 truncate mb-0.5">
                                                            {chat.product.title} • {chat.product.category?.title}
                                                        </p>
                                                    )}
                                                    <p className={`text-sm tracking-wide ${isUnread ? 'text-gray-800 font-medium' : 'text-[#A89BC8]'}`}>
                                                        {preview.length > 25 ? preview.substring(0, 25) + '...' : preview}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-[#A89BC8] whitespace-nowrap">{time}</span>
                                                    {isUnread && (
                                                        <span className="mt-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Full-Screen Version (hidden on md and up) */}
            <div
                className="fixed inset-0 z-[100] bg-black/50 pointer-events-none md:hidden"
                onClick={closeChat}
            >
                <div
                    className="absolute inset-0 bg-[#F3F0FA] pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 pt-14 pb-3 border-b border-[#E6E0F5] bg-[#F3F0FA]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[#7C5CB9]">Chats</h2>

                        </div>
                        <div className="mt-3 relative">
                            <input
                                type="text"
                                placeholder="Search Message..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white h-12 rounded-lg pl-4 pr-10 border border-[#E6E0F5] focus:outline-none focus:ring-1 focus:ring-[#C8B6E2]"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89BC8]" size={20} />
                        </div>
                        <MobileBottomNav />
                    </div>

                    {/* Chat List */}
                    <div className="h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden p-4 space-y-3">
                        {filteredChats.length === 0 ? (
                            <p className="text-center text-[#A89BC8] text-sm py-4 mt-10">No chats found</p>
                        ) : (
                            filteredChats.map(chat => {
                                const otherUser = chat.buyer?._id === currentUserId ? chat.seller : chat.buyer;
                                const partnerName = otherUser?.full_name?.trim() || 'User';
                                const partnerAvatar = otherUser?.avatar;
                                const preview = chat.lastMessage || 'No messages yet';
                                const time = new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                // Check unread
                                const unreadCount = (chat.unreadCount && chat.unreadCount[currentUserId]) || 0;
                                const isUnread = unreadCount > 0;

                                return (
                                    <div
                                        key={chat._id}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${isUnread ? 'bg-white border-l-4 border-[#7C5CB9]' : 'hover:bg-[#EFEAF9]'}`}
                                        onClick={() => {
                                            setActiveChat(chat);
                                        }}
                                    >
                                        <img
                                            src={partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=8069AE&color=fff`}
                                            alt={partnerName}
                                            className="w-12 h-12 rounded-full mr-4 object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-medium text-[#7C5CB9] truncate ${isUnread ? 'font-bold' : ''}`}>{partnerName}</h3>
                                                    {chat.product && (
                                                        <p className="text-xs text-gray-500 truncate mb-0.5">
                                                            {chat.product.title} • {chat.product.category?.title}
                                                        </p>
                                                    )}
                                                    <p className={`text-sm tracking-wide ${isUnread ? 'text-gray-800 font-medium' : 'text-[#A89BC8]'}`}>
                                                        {preview.length > 25 ? preview.substring(0, 25) + '...' : preview}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-[#A89BC8] whitespace-nowrap">{time}</span>
                                                    {isUnread && (
                                                        <span className="mt-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;