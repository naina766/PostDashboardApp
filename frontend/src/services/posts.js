import API from "./api";

const authHeaders = (isFormData = false) => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    ...(isFormData && { "Content-Type": "multipart/form-data" }),
  },
});

export const getPosts = () => API.get("/posts", authHeaders());
export const createPost = (data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  if (data.image) formData.append("image", data.image);
  return API.post("/posts", formData, authHeaders(true));
};
export const updatePost = (id, data) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.image) formData.append("image", data.image);
  return API.put(`/posts/${id}`, formData, authHeaders(true));
};
export const deletePost = (id) => API.delete(`/posts/${id}`, authHeaders());
