// src/components/ChatWidget.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { getHistory, sendMessage } from '../services/chat-api';
import { toast } from 'sonner';

const ChatWidget = ({ chatId, style, index }) => {
    const { chatState, updateMessages, updateText, closeChat, toggleMinimize, appendMessage } = useChat();
    const { chats, currentUserId, chatSessions, activeChats } = chatState;

    // Get session data for THIS chat
    const session = chatSessions[chatId] || { messages: [], text: '', isTyping: false };
    const { messages, text, isTyping } = session;

    // Get window state
    const windowState = activeChats.find(c => c.chatId === chatId) || { isMinimized: false };
    const { isMinimized } = windowState;

    const messagesEndRef = useRef(null);
    const scrollRef = useRef(null);

    const scrollToBottom = (behavior = "auto") => {
        if (scrollRef.current) {
            const { scrollHeight, clientHeight } = scrollRef.current;
            scrollRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: behavior
            });
        }
    };

    // Find active chat details
    const activeChat = chats.find(c => c._id === chatId);
    const otherUser = activeChat?.buyer?._id === currentUserId ? activeChat?.seller : activeChat?.buyer;
    const sellerName = otherUser?.full_name || "User";
    const sellerAvatar = otherUser?.avatar;

    // Load messages on mount
    useEffect(() => {
        if (!chatId) return;

        const loadMessages = async () => {
            // Only fetch if empty to avoid flicker? Or always refresh?
            // If we have messages, assume they are up to date from socket or previous fetch?
            // For now, simple fetch as before.
            try {
                const data = await getHistory(chatId);
                updateMessages(chatId, Array.isArray(data.messages) ? data.messages : []);
            } catch (err) {
                console.error("Failed to load messages", err);
                toast.error("Failed to load chat history");
                updateMessages(chatId, []); // ensure array
            }
        };

        loadMessages();
    }, [chatId]); // Only when chatId changes (mount)

    // Scroll effects
    useEffect(() => {
        if (!isMinimized) {
            setTimeout(() => {
                scrollToBottom("auto");
            }, 100);
        }
    }, [isMinimized, chatId]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom("smooth");
        }
    }, [messages]);

    if (!chatId) return null;

    const handleSend = async () => {
        if (!text?.trim()) return;

        try {
            const response = await sendMessage(chatId, text.trim());

            if (response && response.success && response.data) {
                appendMessage(chatId, response.data);
                updateText(chatId, "");
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

    return (
        <div
            className={`fixed bottom-0 bg-white border border-gray-200 rounded-t-lg shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-[99] transition-all duration-300 flex flex-col`}
            style={{
                ...style,
                height: isMinimized ? '48px' : '400px',
                width: '320px'
            }}
        >
            {/* Header */}
            <div
                className="bg-[#8069AE] text-white p-3 flex justify-between items-center rounded-t-lg cursor-pointer"
                onClick={() => toggleMinimize(chatId)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {sellerAvatar ? (
                        <img src={sellerAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{sellerName.charAt(0)}</div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate text-sm leading-tight">{sellerName}</span>
                        {activeChat?.product && (
                            <span className="text-[10px] text-purple-100 truncate opacity-90">
                                {activeChat.product.category?.title || 'Product'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(chatId); }}
                        className="text-white/80 hover:bg-white/10 p-1.5 rounded-md transition-colors"
                        title={isMinimized ? "Restore" : "Minimize"}
                    >
                        {isMinimized ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeChat(chatId); }}
                        className="text-white/80 hover:bg-red-500/80 p-1.5 rounded-md transition-colors"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div
                        ref={scrollRef}
                        className="flex-1 p-3 overflow-y-auto bg-[#F9F6FF]"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-2xl mb-2">👋</span>
                                <p className="text-xs">Start messaging</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                if (!msg || (!msg.text && typeof msg.text !== 'string') || !msg.sender) return null;
                                const senderId = msg.sender._id ? msg.sender._id : msg.sender;
                                const isOwn = String(senderId) === String(currentUserId);

                                return (
                                    <div
                                        key={msg._id || msg.createdAt}
                                        className={`mb-2 max-w-[85%] p-2.5 rounded-xl text-sm break-words relative group ${isOwn
                                            ? 'ml-auto bg-[#8069AE] text-white rounded-br-none'
                                            : 'mr-auto bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        <div className="mr-8">
                                            {msg.text}
                                        </div>

                                        <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
                                            <span>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                            {isOwn && (
                                                <span className={`${msg.read ? 'text-blue-300' : 'text-purple-200'}`}>
                                                    {/* Double Tick for Read, Single for Sent. 
                                                        Actually WhatsApp uses:
                                                        - 1 Gray Tick (Sent)
                                                        - 2 Gray Ticks (Delivered)
                                                        - 2 Blue Ticks (Read)
                                                        
                                                        Here we simplify: 
                                                        - 1 Tick (Sent) -> we assume sent if rendered.
                                                        - 2 Ticks (Read) -> if msg.read is true.
                                                    */}
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
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />

                        {isTyping && (
                            <div className="ml-2 mb-2 text-xs text-gray-400 italic flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-white">
                        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:border-[#8069AE] focus-within:ring-1 focus-within:ring-[#8069AE]/20 transition-all">
                            <textarea
                                value={text || ''}
                                onChange={(e) => {
                                    updateText(chatId, e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                        e.target.style.height = 'auto';
                                    }
                                }}
                                placeholder="Type..."
                                rows={1}
                                className="flex-1 px-2 py-2 bg-transparent focus:outline-none resize-none overflow-hidden max-h-[80px] text-sm"
                                style={{ minHeight: '36px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text?.trim()}
                                className="bg-[#8069AE] text-white p-2 rounded-lg hover:bg-[#6c4ea6] disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWidget;