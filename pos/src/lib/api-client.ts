import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/method',
  headers: {
    Authorization: "token 12ac5c87763f54e:fa283d1c41064f6", // Provided mandatory token
    "Content-Type": "application/json",
  },
});

// Response Normalization & Global Error Handling
api.interceptors.response.use(
  (response) => {
    // Frappe usually returns data inside a 'message' key
    return response.data?.message || response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', message);
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;
