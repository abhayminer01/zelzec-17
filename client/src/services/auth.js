import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 5000,
    withCredentials: true
});

export const checkAuth = async () => {
    try {
        const req = await api.get('/api/v1/auth/check', {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
    }
}

export const visitorCount = async () => {
    try {
        const req = await api.post('/api/v1/visitor/record', {}, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
    }
}

export const userLogin = async (payload) => {
    try {
        const req = await api.post('/api/v1/auth/login', payload, {
            withCredentials: true,
        });
        return req.data;
    } catch (error) {
        console.log(error);
        // ✅ Return a consistent structure even on error
        return error?.response?.data || { success: false, message: "Network error" };
    }
};

export const registerUser = async (payload) => {
    try {
        const req = await api.post('/api/v1/auth/register', payload, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const getUser = async () => {
    try {
        const req = await api.get('/api/v1/auth/', {
            withCredentials: true
        });
        return req.data.data;
    } catch (error) {
        console.log(error);
    }
}

export const updateUser = async (payload) => {
    try {
        const req = await api.put('/api/v1/auth/', payload, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const logoutUser = async () => {
    try {
        const req = await api.post('/api/v1/auth/logout', {}, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const deleteUser = async () => {
    try {
        const req = await api.delete('/api/v1/auth/', {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const sendOtp = async (email) => {
    try {
        const req = await api.post('/api/v1/auth/send-otp', { email }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const verifyOtp = async (email, otp) => {
    try {
        const req = await api.post('/api/v1/auth/verify-otp', { email, otp }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const resetPassword = async (email, otp, newPassword) => {
    try {
        const req = await api.post('/api/v1/auth/reset-password', { email, otp, newPassword }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const toggleFavorite = async (productId) => {
    try {
        const req = await api.post('/api/v1/auth/favorites', { productId }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const getFavorites = async () => {
    try {
        const req = await api.get('/api/v1/auth/favorites', {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const verifyEmail = async (email, otp) => {
    try {
        const req = await api.post('/api/v1/auth/verify-email', { email, otp }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}

export const resendVerificationOtp = async (email) => {
    try {
        const req = await api.post('/api/v1/auth/resend-verification', { email }, {
            withCredentials: true
        });
        return req.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { success: false, message: "Network error" };
    }
}