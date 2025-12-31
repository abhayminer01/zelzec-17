// src/components/ChatContainer.jsx
import React from 'react';
import ChatWidget from './ChatWidget';
import { useChat } from '../contexts/ChatContext';

const ChatContainer = () => {
    const { chatState } = useChat();
    const { activeChats } = chatState;

    if (!activeChats || activeChats.length === 0) return null;

    return (
        <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex items-end pr-5 gap-5">
            {activeChats.map((chat, index) => (
                <div key={chat.chatId} className="pointer-events-auto relative">
                    <ChatWidget
                        chatId={chat.chatId}
                        index={index}
                        style={{ position: 'relative', bottom: 0, right: 0 }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatContainer;
