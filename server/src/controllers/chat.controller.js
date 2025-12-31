const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Product = require("../models/product.model");
const { getIO } = require("../socket");

const startChat = async (req, res) => {
    try {
        const { productId } = req.body;
        const buyerId = req.user._id;

        // 1. Check if chat already exists
        // We need to check if a chat exists for this product between this buyer and the seller
        // Ideally, one chat per product per buyer/seller pair? Or just one chat per buyer/seller?
        // The original model linked chat to a specific product. Let's keep that.

        let chat = await Chat.findOne({ product: productId, buyer: buyerId });

        if (!chat) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const sellerId = product.user;

            if (String(buyerId) === String(sellerId)) {
                return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
            }

            chat = await Chat.create({
                buyer: buyerId,
                seller: sellerId,
                product: productId,
                lastMessage: "",
                lastMessageAt: new Date(),
                unreadCount: {
                    [buyerId]: 0,
                    [sellerId]: 0
                }
            });
        }

        // Populate so frontend has data
        chat = await chat.populate([
            { path: "buyer", select: "full_name email avatar" },
            { path: "seller", select: "full_name email avatar" },
            {
                path: "product",
                select: "title user images price category",
                populate: { path: "category", select: "title" }
            }
        ]);

        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        console.error("Start chat error:", error);
        res.status(500).json({ success: false, err: error.message });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const senderId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Determine receiver
        const receiverId = String(senderId) === String(chat.buyer) ? chat.seller : chat.buyer;

        const message = await Message.create({
            sender: senderId,
            chatId: chatId,
            text: text,
            read: false
        });

        // Update chat with last message and increment unread for receiver
        // Using $inc with dynamic key
        const update = {
            lastMessage: text,
            lastMessageAt: new Date()
        };
        // We can't use dynamic key easily in simple object, use computed property name
        // But mapped types in Mongoose are Map, so we use 'unreadCount.userId'
        // Wait, unreadCount is defined as Map. MongoDB updates to Map fields are tricky.
        // Actually, if I defined it as `unreadCount: { type: Map, of: Number }`, it is stored as an object or just keys?
        // It's safer to use dot notation if it was a subdocument, but for Map, standard dot notation usually works if keys are strings.
        // MongoDB stores Maps as objects if keys are strings. ObjectId as string works.

        const incQuery = {};
        incQuery[`unreadCount.${receiverId}`] = 1;

        await Chat.findByIdAndUpdate(chatId, {
            $set: update,
            $inc: incQuery
        });

        // Realtime Emit
        const io = getIO();
        const populatedMessage = await message.populate("sender", "full_name email avatar");

        io.to(chatId).emit("receive_message", populatedMessage);

        // Notify receiver for global unread count update (optional, but good)
        // io.to(receiverId.toString()).emit("new_message_notification", { chatId, text, sender: senderId });

        res.status(200).json({ success: true, message: "sent succesfully", data: populatedMessage });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ success: false, err: error.message });
    }
}

const getChatHistory = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId)
            .populate("buyer", "full_name email avatar")
            .populate("seller", "full_name email avatar")
            .populate({
                path: "product",
                select: "title user images price category",
                populate: [
                    { path: "user", select: "full_name" },
                    { path: "category", select: "title" }
                ]
            });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Access control
        if (String(chat.buyer._id) !== String(userId) && String(chat.seller._id) !== String(userId)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const messages = await Message.find({ chatId })
            .populate("sender", "full_name email avatar")
            .sort({ createdAt: 1 });

        // If I am viewing, mark my unread count as 0 ?
        // Or should I have a separate API for 'read'?
        // Usually, opening the chat marks it as read.
        // Let's reset unread count for this user here.

        // Update unread count for CURRENT user to 0
        const updateFile = {};
        updateFile[`unreadCount.${userId}`] = 0;
        await Chat.findByIdAndUpdate(chatId, { $set: updateFile });

        res.status(200).json({
            success: true,
            chat,
            messages
        });

    } catch (error) {
        console.log("GET CHAT HISTORY ERROR:", error);
        res.status(500).json({ success: false, err: error.message });
    }
};

const getMyChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({
            $or: [
                { buyer: userId },
                { seller: userId }
            ]
        })
            .populate('buyer', 'full_name email avatar')
            .populate('seller', 'full_name email avatar')
            .populate({
                path: 'product',
                select: 'title images price category',
                populate: { path: "category", select: "title" }
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            chats: chats,
            currentUserId: userId
        });

    } catch (error) {
        console.error("Get my chats error:", error);
        res.status(500).json({ success: false, err: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user._id;

        // 1. Update unread count in Chat model
        const update = {};
        update[`unreadCount.${userId}`] = 0;
        await Chat.findByIdAndUpdate(chatId, { $set: update });

        // 2. Mark messages as read in Message model
        // We update messages in this chat where WE are the receiver (sender is NOT us) and read is false
        const result = await Message.updateMany(
            { chatId: chatId, sender: { $ne: userId }, read: false },
            { $set: { read: true } }
        );

        // 3. Emit real-time event if any messages were updated
        if (result.modifiedCount > 0) {
            const io = getIO();
            // Emit to the chat room. Both users are in it.
            // The sender will receive this and update their UI (ticks).
            // The receiver (me) will receive it (optional, but good for sync across devices).
            io.to(chatId).emit("messages_read", { chatId, readerId: userId });
        }

        res.status(200).json({ success: true, updatedCount: result.modifiedCount });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ success: false, err: error.message });
    }
}

module.exports = {
    startChat,
    sendMessage,
    getChatHistory,
    getMyChats,
    markAsRead
};
