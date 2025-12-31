import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    timeout: 5000,
});

export const getVisitorStats = async () => {
    try {
        const res = await api.get('/api/v1/visitor/stats');
        return res.data; // { daily, monthly, total }
    } catch (error) {
        console.error(error);
        return null;
    }
}
