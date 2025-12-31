// src/contexts/ChatContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getMyChats, markAsRead } from '../services/chat-api';
import { useSocket } from './SocketContext';
import { toast } from 'sonner';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const socket = useSocket();
    const [chatState, setChatState] = useState({
        isSidebarOpen: false,
        chats: [], // All available chats list (for sidebar)
        currentUserId: null,

        // Multi-chat support
        activeChats: [], // Array of { chatId, isMinimized }
        chatSessions: {}, // { [chatId]: { messages: [], text: '', isTyping: false } }
    });

    const activeChatsRef = useRef(chatState.activeChats);
    const currentUserIdRef = useRef(chatState.currentUserId);

    useEffect(() => {
        activeChatsRef.current = chatState.activeChats;
        currentUserIdRef.current = chatState.currentUserId;
    }, [chatState.activeChats, chatState.currentUserId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receive_message", (message) => {
            const activeChats = activeChatsRef.current;
            const isChatOpen = activeChats.some(c => c.chatId === message.chatId);

            // 1. Update session messages if chat is open
            if (isChatOpen) {
                setChatState(prev => {
                    const session = prev.chatSessions[message.chatId] || { messages: [], text: '', isTyping: false };

                    // Deduplicate
                    if (session.messages.some(m => m._id === message._id)) return prev;

                    return {
                        ...prev,
                        chatSessions: {
                            ...prev.chatSessions,
                            [message.chatId]: {
                                ...session,
                                messages: [...session.messages, message]
                            }
                        }
                    };
                });

                // Mark as read immediately if chat is open
                markAsRead(message.chatId).catch(err => console.error("Failed to mark read on receive", err));
            }

            // 2. Update sidebar chat list (preview, order, unread)
            setChatState(prev => {
                const newChats = [...prev.chats];
                const chatIndex = newChats.findIndex(c => c._id === message.chatId);

                if (chatIndex > -1) {
                    const updatedChat = {
                        ...newChats[chatIndex],
                        lastMessage: message.text,
                        lastMessageAt: message.createdAt
                    };

                    // Increment unread if chat is NOT open (or maybe focused logic later)
                    if (!isChatOpen) {
                        const myId = currentUserIdRef.current;
                        if (myId) {
                            const currentUnread = updatedChat.unreadCount || {};
                            updatedChat.unreadCount = { ...currentUnread, [myId]: (currentUnread[myId] || 0) + 1 };
                        }
                    }

                    newChats.splice(chatIndex, 1);
                    newChats.unshift(updatedChat);
                }
                return { ...prev, chats: newChats };
            });

            if (!isChatOpen && activeChats.every(c => c.chatId !== message.chatId)) {
                toast.info(`New message from ${message.sender?.full_name || 'User'}`);
            }
        });

        socket.on("typing", (chatId) => {
            if (activeChatsRef.current.some(c => c.chatId === chatId)) {
                setChatState(prev => ({
                    ...prev,
                    chatSessions: {
                        ...prev.chatSessions,
                        [chatId]: {
                            ...(prev.chatSessions[chatId] || { messages: [], text: '' }),
                            isTyping: true
                        }
                    }
                }));
            }
        });

        socket.on("stop_typing", (chatId) => {
            if (activeChatsRef.current.some(c => c.chatId === chatId)) {
                setChatState(prev => ({
                    ...prev,
                    chatSessions: {
                        ...prev.chatSessions,
                        [chatId]: {
                            ...(prev.chatSessions[chatId] || { messages: [], text: '' }),
                            isTyping: false
                        }
                    }
                }));
            }
        });

        socket.on("messages_read", ({ chatId, readerId }) => {
            // Update messages in the chat session to be read
            setChatState(prev => {
                const session = prev.chatSessions[chatId];
                if (!session || !session.messages) return prev;

                // If the reader is the current user, we don't need to update our own view of "my messages sent to them"
                // But wait, if I read it, I shouldn't see blue ticks on MY messages (sent by me).
                // I should see blue ticks on messages SENT BY ME when the OTHER person reads them.
                // So if readerId !== currentUser, then MY messages to them are read.

                const myId = currentUserIdRef.current;
                if (readerId === myId) return prev; // I read them, nothing changes for my sent messages visualization? 
                // actually if I read them, the unread count changes, but that's handled by markAsRead API response usually or logic.

                const newMessages = session.messages.map(msg => {
                    // if msg.sender is me, and it was unread, mark it read
                    // msg.sender can be object or ID.
                    const senderId = msg.sender._id || msg.sender;
                    if (String(senderId) === String(myId)) {
                        return { ...msg, read: true };
                    }
                    return msg;
                });

                return {
                    ...prev,
                    chatSessions: {
                        ...prev.chatSessions,
                        [chatId]: {
                            ...session,
                            messages: newMessages
                        }
                    }
                };
            });
        });

        return () => {
            socket.off("receive_message");
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("messages_read");
        };
    }, [socket]);

    const loadChats = async () => {
        try {
            const data = await getMyChats();
            setChatState(prev => ({
                ...prev,
                chats: data.chats || [],
                currentUserId: data.currentUserId
            }));
        } catch (err) {
            console.error("Failed to load chats", err);
        }
    };

    const openChat = async (data) => {
        const { chatId, initialText } = data;

        setChatState(prev => {
            // Remove if already present (to re-add at end for focus)
            const otherChats = prev.activeChats.filter(c => c.chatId !== chatId);

            // Init or get existing session
            const existingSession = prev.chatSessions[chatId] || { messages: [], text: '', isTyping: false };

            // Update text if initialText is provided, otherwise keep existing
            const newText = initialText !== undefined ? initialText : existingSession.text;

            return {
                ...prev,
                activeChats: [...otherChats, { chatId, isMinimized: false }],
                chatSessions: {
                    ...prev.chatSessions,
                    [chatId]: {
                        ...existingSession,
                        text: newText
                    }
                }
            };
        });

        if (socket) socket.emit("join_chat", chatId);

        try {
            await markAsRead(chatId);
            setChatState(prev => {
                const newChats = prev.chats.map(c => {
                    if (c._id === chatId) {
                        const currentUserId = prev.currentUserId;
                        let newUnread = { ...(c.unreadCount || {}) };
                        if (currentUserId) newUnread[currentUserId] = 0;
                        return { ...c, unreadCount: newUnread };
                    }
                    return c;
                });
                return { ...prev, chats: newChats };
            });
        } catch (e) { console.error(e) }
    };

    const closeChat = (chatId) => {
        if (socket) socket.emit("leave_chat", chatId);

        setChatState(prev => ({
            ...prev,
            activeChats: prev.activeChats.filter(c => c.chatId !== chatId),
        }));
    };

    const toggleMinimize = (chatId) => {
        setChatState(prev => ({
            ...prev,
            activeChats: prev.activeChats.map(c =>
                c.chatId === chatId ? { ...c, isMinimized: !c.isMinimized } : c
            )
        }));
    };

    const closeSidebar = () => {
        setChatState(prev => ({ ...prev, isSidebarOpen: false }));
    };

    const toggleSidebar = async () => {
        setChatState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
        if (!chatState.isSidebarOpen) {
            await loadChats();
        }
    };

    const appendMessage = (chatId, message) => {
        setChatState(prev => {
            const session = prev.chatSessions[chatId] || { messages: [], text: '', isTyping: false };

            // Deduplicate
            if (session.messages.some(m => m._id === message._id)) return prev;

            return {
                ...prev,
                chatSessions: {
                    ...prev.chatSessions,
                    [chatId]: {
                        ...session,
                        messages: [...session.messages, message]
                    }
                }
            };
        });
    };

    const updateMessages = (chatId, newMessages) => {
        setChatState(prev => ({
            ...prev,
            chatSessions: {
                ...prev.chatSessions,
                [chatId]: {
                    ...(prev.chatSessions[chatId] || { text: '', isTyping: false }),
                    messages: newMessages || []
                }
            }
        }));
    };

    const typingTimeoutsRef = useRef({});

    const updateText = (chatId, text) => {
        setChatState(prev => ({
            ...prev,
            chatSessions: {
                ...prev.chatSessions,
                [chatId]: {
                    ...(prev.chatSessions[chatId] || { messages: [], isTyping: false }),
                    text
                }
            }
        }));

        if (socket) {
            // Only emit 'typing' if we haven't already set a timeout (meaning we are starting a typing burst)
            // OR if we want to refresh the status periodically? 
            // Most clients just show it until stopped.
            // Let's emit once per burst.
            if (!typingTimeoutsRef.current[chatId]) {
                socket.emit("typing", chatId);
            }

            // Clear existing timeout to reset the idle timer
            if (typingTimeoutsRef.current[chatId]) {
                clearTimeout(typingTimeoutsRef.current[chatId]);
            }

            // Set new timeout to emit stop_typing after delay
            typingTimeoutsRef.current[chatId] = setTimeout(() => {
                socket.emit("stop_typing", chatId);
                typingTimeoutsRef.current[chatId] = null;
            }, 2000);
        }
    };

    const setActiveChat = (chat) => {
        openChat({
            chatId: chat._id,
            user: chat.buyer === chatState.currentUserId ? chat.seller : chat.buyer,
            product: chat.product,
            currentUserId: chatState.currentUserId,
        });
    };

    return (
        <ChatContext.Provider value={{
            chatState,
            openChat,
            closeChat,
            closeSidebar,
            toggleSidebar,
            toggleMinimize,
            setActiveChat,
            updateMessages,
            updateText,
            appendMessage,
            loadChats
        }}>
            {children}
        </ChatContext.Provider>
    );
};