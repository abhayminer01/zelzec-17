// src/components/MobileChatSidebar.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import MobileBottomNav from './MobileBottomNav';

const MobileChatSidebar = () => {
  const { chatState, closeChat, setActiveChat } = useChat();
  const { isSidebarOpen, chats = [], currentUserId } = chatState; // Default chats to []

  const [search, setSearch] = useState('');

  // Only show if sidebar is open AND no active chat
  if (!isSidebarOpen || chatState.activeChatId) return null;

  const filteredChats = Array.isArray(chats) ? chats.filter(chat => {
    const otherUser = chat.buyer?._id === currentUserId ? chat.seller : chat.buyer;
    const partnerName = otherUser?.full_name?.trim() || 'User';
    const productTitle = chat.product?.title || '';
    const lastMessage = chat.lastMessage || '';

    const lowerSearch = search.toLowerCase();

    return partnerName.toLowerCase().includes(lowerSearch) ||
      productTitle.toLowerCase().includes(lowerSearch) ||
      lastMessage.toLowerCase().includes(lowerSearch);
  }) : [];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F3F0FA] flex flex-col safe-area-bottom font-sans">
      {/* Header */}
      <div className="p-4 pt-14 pb-3 border-b border-[#E6E0F5] bg-[#F3F0FA] shrink-0">
        <h2 className="text-xl font-bold text-[#7C5CB9]">Messages</h2>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white h-11 rounded-xl pl-10 pr-4 border border-[#E6E0F5] focus:outline-none focus:ring-2 focus:ring-[#C8B6E2] text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BC8]" size={18} />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 pb-24"> {/* pb-24 for bottom nav space */}
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#A89BC8]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Search size={24} className="text-[#D1C4E9]" />
            </div>
            <p className="text-sm font-medium">No chats found</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const otherUser = chat.buyer?._id === currentUserId ? chat.seller : chat.buyer;
            const partnerName = otherUser?.full_name?.trim() || 'User';
            const partnerAvatar = otherUser?.avatar;
            const preview = chat.lastMessage || 'No messages yet';
            const time = chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            // Unread logic
            const unreadCount = (chat.unreadCount && chat.unreadCount[currentUserId]) || 0;
            const isUnread = unreadCount > 0;

            return (
              <div
                key={chat._id}
                className={`flex items-center p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] border border-transparent ${isUnread ? 'bg-white shadow-md border-[#E6E0F5]' : 'bg-white/50 hover:bg-white border-[#F0EDF6]'
                  }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="relative">
                  <img
                    src={partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=8069AE&color=fff`}
                    alt={partnerName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100"
                  />
                  {isUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                </div>

                <div className="flex-1 min-w-0 ml-3.5">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className={`text-base truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {partnerName}
                    </h3>
                    <span className={`text-[11px] whitespace-nowrap ml-2 ${isUnread ? 'text-[#7C5CB9] font-bold' : 'text-gray-400'}`}>
                      {time}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {preview}
                    </p>
                    {isUnread && (
                      <span className="min-w-[1.25rem] h-5 flex items-center justify-center bg-[#7C5CB9] text-white text-[10px] font-bold rounded-full px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation - Positioned at bottom */}
      <div className="fixed bottom-0 w-full md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default MobileChatSidebar;