import API from "./api";

export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/register", data);
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const logout = () => {
  localStorage.removeItem("token");
};
