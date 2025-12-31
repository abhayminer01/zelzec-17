import axios from 'axios';
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/product`,
  timeout: 5000,
  withCredentials: true
});

export const createProduct = async (data) => {
  const formData = new FormData();

  formData.append("category", data.category);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("form_data", JSON.stringify(data.form_data));
  formData.append("price", data.price);
  formData.append("location", JSON.stringify(data.location));

  data.images.forEach((img) => {
    formData.append("images", img.file);
  });

  const res = await api.post("/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getAllProducts = async (params) => {
  try {
    const req = await api.get('/', { params });
    return req.data;
  } catch (error) {
    // console.log(error);
    return { success: false, message: error.message };
  }
}

// GET PRODUCT DATAq
export const getProduct = async (id) => {
  try {
    const req = await api.get(`/${id}`);
    return req.data;
  } catch (error) {
    // console.log(error);
    return { success: false, message: error.message };
  }
}

export const getListedProducts = async () => {
  try {
    const req = await api.get('/profile');
    return req.data;
  } catch (error) {
    // console.log(error);
    return { success: false, message: error.message };
  }
}

export const getProductsOfCategory = async (id) => {
  try {
    const req = await api.get(`/category/${id}`);
    return req.data;
  } catch (error) {
    // console.log(error);
    return { success: false, message: error.message };
  }
}

export const getRelatedProducts = async (id) => {
  try {
    const req = await api.get(`/related-products/${id}`);
    return req.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export const deleteProduct = async (id) => {
  try {
    const req = await api.delete(`/${id}`);
    return req.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
}

export const updateProduct = async (id, data) => {
  try {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};

    const req = await api.put(`/${id}`, data, config);
    return req.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
}

export const getHomePageData = async () => {
  try {
    const req = await api.get('/home');
    return req.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
}