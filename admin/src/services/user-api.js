import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1` || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getAllUsers = async (params) => {
    try {
        const res = await axiosInstance.get("/admin/users", { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, message: error.response?.data?.message || "Failed to fetch users" };
    }
};

export const deleteUser = async (id) => {
    try {
        const res = await axiosInstance.delete(`/admin/users/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: error.response?.data?.message || "Failed to delete user" };
    }
};

export const updateUser = async (id, data) => {
    try {
        const res = await axiosInstance.put(`/admin/users/${id}`, data);
        return res.data;
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: error.response?.data?.message || "Failed to update user" };
    }
};
