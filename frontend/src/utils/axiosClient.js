import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawUrl.replace(/\/$/, "");

const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;