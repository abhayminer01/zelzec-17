const { Server } = require("socket.io");
const sharedSession = require("express-socket.io-session");
const User = require("./models/user.model");

let io;

const initializeSocket = (server, sessionMiddleware) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174', 'https://zelzec.com', 'https://admin.zelzec.com'],
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    // Share session with express
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        const session = socket.request.session;
        if (session && session.user && session.user.id) {
            try {
                // Verify user exists
                const user = await User.findById(session.user.id).select('full_name email');
                if (user) {
                    socket.user = user;
                    return next();
                }
            } catch (err) {
                console.error("Socket auth error:", err);
            }
        }
        next(new Error("Authentication error"));
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.full_name} (${socket.user._id})`);

        // Join user's personal room for notifications
        socket.join(socket.user._id.toString());

        // Join a specific chat room
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.user._id} joined chat ${chatId}`);
        });

        // Leave a specific chat room
        socket.on("leave_chat", (chatId) => {
            socket.leave(chatId);
            console.log(`User ${socket.user._id} left chat ${chatId}`);
        });

        socket.on("typing", (chatId) => {
            socket.to(chatId).emit("typing", chatId);
        });

        socket.on("stop_typing", (chatId) => {
            socket.to(chatId).emit("stop_typing", chatId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.user._id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initializeSocket, getIO };
