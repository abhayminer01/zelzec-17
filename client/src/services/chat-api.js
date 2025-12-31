import axios from 'axios';
const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/chat`,
    timeout: 5000,
    withCredentials: true
});

export const startChat = async (productId) => {
    try {
        const req = await api.post('/start', { productId: productId });
        return req.data;
    } catch (error) {
        console.log(error);
    }
}

export const sendMessage = async (chatId, text) => {
    try {
        const req = await api.post("/send", {
            chatId,
            text
        });

        return req.data;
    } catch (error) {
        console.log(error);
    }
};


export const getHistory = async (chatId) => {
    try {
        const res = await api.get(`/history/${chatId}`);
        return res.data
    } catch (error) {
        console.log(error)
    }
};

export const getMyChats = async () => {
    const res = await api.get('/my-chats');
    return res.data;
};

export const markAsRead = async (chatId) => {
    try {
        const res = await api.post('/mark-read', { chatId });
        return res.data;
    } catch (error) {
        console.log("Mark read error", error);
    }
};