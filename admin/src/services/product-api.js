import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1` || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getAllProducts = async (params) => {
    try {
        const res = await axiosInstance.get("/product", { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, message: error.response?.data?.message || "Failed to fetch products" };
    }
};

export const deleteProduct = async (id, reason) => {
    try {
        const res = await axiosInstance.delete(`/admin/product/${id}`, {
            data: { reason }
        });
        return res.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: error.response?.data?.message || "Failed to delete product" };
    }
};
