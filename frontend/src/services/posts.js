import API from "./api";

export const getPosts = (params = {}) => {
  return API.get("/posts", { params });
};

export const getPostById = (id) => {
  return API.get(`/posts/${id}`);
};

export const createPost = (data) => {
  if (data instanceof FormData) {
    return API.post("/posts", data);
  }
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.image) formData.append("image", data.image);
  if (data.postType) formData.append("postType", data.postType);
  if (data.poll) formData.append("poll", JSON.stringify(data.poll));
  if (data.linkPreview) formData.append("linkPreview", JSON.stringify(data.linkPreview));
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

export const toggleSave = (id) => API.post(`/posts/${id}/save`);

export const getSavedPosts = (params = {}) => API.get("/posts/saved/me", { params });

export const votePoll = (id, optionIndex) => API.post(`/posts/${id}/vote`, { optionIndex });

export const addComment = (id, text) => API.post(`/posts/${id}/comments`, { text });

export const deleteComment = (postId, commentId) =>
  API.delete(`/posts/${postId}/comments/${commentId}`);

export const addReply = (postId, commentId, text) =>
  API.post(`/posts/${postId}/comments/${commentId}/replies`, { text });

export const toggleCommentLike = (postId, commentId) =>
  API.post(`/posts/${postId}/comments/${commentId}/like`);

export const getMyPosts = (params = {}) => API.get("/posts/me", { params });

export const archivePost = (id) => API.patch(`/posts/${id}/archive`);
