import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 5000,
});

export const checkSession = async () => {
  try {
    const res = await api.get("/api/v1/admin/check-session");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const loginUser = async (payload) => {
  try {
    const req = await api.post('/api/v1/admin/login', payload);
    return req.data;
  } catch (error) {
    console.log(error);
  }
}

export const getAllAdmins = async () => {
  try {
    const res = await api.get("/api/v1/admin");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const registerAdmin = async (payload) => {
  try {
    const res = await api.post("/api/v1/admin/register", payload);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const updateAdmin = async (id, payload) => {
  try {
    const res = await api.put(`/api/v1/admin/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const deleteAdmin = async (id) => {
  try {
    const res = await api.delete(`/api/v1/admin/${id}`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
