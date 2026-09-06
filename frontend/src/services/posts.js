import API from "./api";

export const getPosts = (params = {}) => {
  return API.get("/posts", { params });
};

export const createPost = (data) => {
  if (data instanceof FormData) {
    return API.post("/posts", data);
  }
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.image) formData.append("image", data.image);
  return API.post("/posts", formData);
};

export const updatePost = (id, data) => {
  if (data instanceof FormData) {
    return API.put(`/posts/${id}`, data);
  }
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.content !== undefined) formData.append("content", data.content);
  if (data.image) formData.append("image", data.image);
  return API.put(`/posts/${id}`, formData);
};

export const deletePost = (id) => API.delete(`/posts/${id}`);

export const toggleLike = (id) => API.post(`/posts/${id}/like`);

export const addComment = (id, text) => API.post(`/posts/${id}/comments`, { text });
