import axios from "axios";

const api = axios.create({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    withCredentials: true,
});

export default api;