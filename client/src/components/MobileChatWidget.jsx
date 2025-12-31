// src/components/MobileChatWidget.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { getHistory, sendMessage } from '../services/chat-api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const MobileChatWidget = () => {
  const { chatState, updateMessages, updateText, closeChat, appendMessage } = useChat();
  const { activeChats, chatSessions, currentUserId, chats } = chatState;

  // For mobile, we focus the last active chat (most recently opened)
  const activeChatObj = activeChats.length > 0 ? activeChats[activeChats.length - 1] : null;
  const activeChatId = activeChatObj?.chatId;

  const messagesEndRef = useRef(null);

  // Derive active chat
  const activeChat = chats.find(c => c._id === activeChatId);
  const otherUser = activeChat?.buyer?._id === currentUserId ? activeChat?.seller : activeChat?.buyer;
  const sellerName = otherUser?.full_name || "User";
  const sellerAvatar = otherUser?.avatar;

  // Get session data
  const session = (activeChatId && chatSessions[activeChatId]) || { messages: [], text: '', isTyping: false };
  const { messages, text } = session;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      try {
        const data = await getHistory(activeChatId);
        updateMessages(activeChatId, Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        console.error("Failed to load messages", err);
        toast.error("Failed to load chat history");
        updateMessages(activeChatId, []);
      }
    };

    loadMessages();
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!text?.trim()) return;

    try {
      const response = await sendMessage(activeChatId, text.trim());
      if (response && response.success && response.data) {
        appendMessage(activeChatId, response.data);
        updateText(activeChatId, "");
      }
    } catch (err) {
      console.error("Send failed", err);
      toast.error("Message failed to send");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Only show when a chat is active
  if (!activeChatId) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F3F4F6] flex flex-col safe-area-bottom font-sans">
      {/* Header with Glassmorphism feel */}
      <div className="bg-gradient-to-r from-[#8069AE] to-[#9C82D1] text-white p-4 flex items-center shrink-0 shadow-md">
        <button
          onClick={() => closeChat(activeChatId)}
          className="mr-3 p-1.5 -ml-1 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            {sellerAvatar ? (
              <img src={sellerAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover bg-white ring-2 ring-white/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold ring-2 ring-white/30">
                {(sellerName?.charAt(0) || 'U').toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#8069AE] rounded-full"></div>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight tracking-wide">{sellerName}</span>
            {activeChat?.product && (
              <span className="text-xs text-indigo-100/90 truncate max-w-[200px] flex items-center gap-1">
                <span>RE:</span> {activeChat.product.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (!msg || typeof msg.text !== 'string' && !msg.sender) return null;
            const senderId = msg.sender._id ? msg.sender._id : msg.sender;
            const isOwn = String(senderId) === String(currentUserId);

            // Format time
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col max-w-[85%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div
                  className={`px-4 py-2 pb-4 rounded-2xl break-words text-[15px] shadow-sm relative min-w-[80px] group ${isOwn
                    ? 'bg-gradient-to-br from-[#8069AE] to-[#6A5299] text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                >
                  <span className="block mb-1">{msg.text}</span>
                  <div className={`absolute bottom-1 right-2 flex items-center gap-1 leading-none ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
                    <span className="text-[10px] opacity-80">{time}</span>
                    {isOwn && (
                      <span className={`${msg.read ? 'text-blue-300' : 'text-purple-200'} ml-0.5`}>
                        {msg.read ? (
                          <div className="flex -space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white shrink-0 mb-16 md:mb-0 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-[24px] border border-gray-200 focus-within:border-[#8069AE] focus-within:ring-2 focus-within:ring-[#8069AE]/10 transition-all">
          <textarea
            value={text || ''}
            onChange={(e) => {
              updateText(activeChatId, e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                e.target.style.height = 'auto';
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-[15px] resize-none max-h-32 min-h-[48px] placeholder:text-gray-400"
          />
          <button
            onClick={() => {
              handleSend();
              const textarea = document.querySelector('textarea.resize-none');
              if (textarea) textarea.style.height = 'auto';
            }}
            disabled={!text?.trim()}
            className="bg-[#8069AE] text-white p-3 rounded-full hover:bg-[#6A5299] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-[#8069AE]/20 mb-0.5 mr-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal relative left-[1px]"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" /><path d="M6 12h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default MobileChatWidget;