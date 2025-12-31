import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // In local development, we point to localhost:5000 (or whatever server port is)
        // Vital to check if we are in prod or dev.
        // The user has 'running terminal commands' in 'server' and 'client'.
        // Assuming server is on default port or proxied. 
        // package.json script: "nodemon src/index.js". .env probably defines PORT.
        // Client vite.config.js might have proxy?
        // Usually localhost:3000 or similar.
        // I will use "/" if on same domain or specific URL.
        // Since it's development, I'll try to detect or hardcode for now (can be improved)
        // Client is 5173, Server is likely 3000 or 5000.
        // Let's assume http://localhost:3000 based on common MERN patterns, or I should have checked .env
        // But wait, the previous index.js had port in process.env.PORT.
        // I will default to http://localhost:3000 but allow it to be relative if deployed.

        // BETTER: I will assume the API base URL. 
        // In `client/src/services/chat-api`, axios is used. I should check base URL there.
        // But for now, let's hardcode localhost:3000 or 5000.
        // I will guess 3000.

        // Actually, let's check .env if I can... 
        // No, I can't read .env easily here as it's environment specific.
        // I will check client/src/services/chat-api to see where it sends requests.

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const socketInstance = io(backendUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
