import API from "./api";

export const getProfileByUsername = (username) => API.get(`/users/profile/${username}`);

export const updateProfile = (data) => API.put("/users/profile", data);

export const uploadAvatar = (formData) =>
  API.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadCover = (formData) =>
  API.post("/users/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const followUser = (id) => API.post(`/users/${id}/follow`);

export const unfollowUser = (id) => API.delete(`/users/${id}/follow`);

export const getFollowers = (id, params = {}) => API.get(`/users/${id}/followers`, { params });

export const getFollowing = (id, params = {}) => API.get(`/users/${id}/following`, { params });

export const getSuggestions = (limit = 5) => API.get("/users/suggestions", { params: { limit } });
