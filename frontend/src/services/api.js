import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    if (import.meta.env.PROD) {
      console.warn("⚠️ Warning: VITE_API_URL is not configured. Falling back to relative '/api'.");
      return "/api";
    }
    return "http://localhost:5000/api";
  }
  return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 12000, // 12 seconds request timeout
});

// Request interceptor to automatically add JWT token from localStorage and handle uploads
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Accommodate legitimate multipart file uploads with generous timeout (60s)
  if (config.data instanceof FormData || config.isUpload) {
    config.timeout = 60000;
  }

  return config;
});

// Automatic token refresh interceptor on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refreshing fails or login/register fails
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        localStorage.removeItem("token");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${getBaseUrl()}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem("token", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return API(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Catch and normalize timeout errors gracefully
    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      (typeof error.message === "string" && error.message.toLowerCase().includes("timeout"));

    if (isTimeout) {
      const timeoutMsg = "Server is taking too long to respond. Please try again.";
      error.message = timeoutMsg;
      if (error.response) {
        if (!error.response.data) error.response.data = {};
        error.response.data.message = timeoutMsg;
      } else {
        error.response = { data: { message: timeoutMsg } };
      }
    }

    return Promise.reject(error);
  }
);

export default API;

