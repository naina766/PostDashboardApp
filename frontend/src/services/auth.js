import API from "./api";

export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/register", data);
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);

export const refreshSession = (refreshToken) => API.post("/auth/refresh", { refreshToken });

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    if (refreshToken) {
      await API.post("/auth/logout", { refreshToken });
    }
  } catch {
    // Continue clearing local storage even if network call fails
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

export const logoutAll = async () => {
  try {
    await API.post("/auth/logout-all");
  } catch {
    // Continue
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

