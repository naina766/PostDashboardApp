import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:5000/api";
  return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

// Interceptor to automatically add JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
