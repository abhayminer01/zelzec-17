import axios from 'axios';
const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/category`,
    timeout: 5000,
    withCredentials: true
});

export const getPrimaryCategories = async () => {
    try {
        const req = await api.get('/primary');
        return req.data;
    } catch (error) {
        console.log(error);
    }
}

export const getCategoryForm = async (id) => {
    try {
        const req = await api.get(`/formdata/${id}`);
        return req.data;
    } catch (error) {
        console.log(error);
    }
}

export const getAllCategories = async () => {
    try {
        const req = await api.get('/');
        return req.data;
    } catch (error) {
        console.log(error);
    }
}