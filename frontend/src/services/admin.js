import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = (params = {}) => API.get("/admin/users", { params });
export const toggleUserSuspension = (id) => API.patch(`/admin/users/${id}/suspend`);
export const updateUserRole = (id, role) => API.patch(`/admin/users/${id}/role`, { role });
export const adminDeletePost = (id) => API.delete(`/admin/posts/${id}`);
export const getAuditLogs = (params = {}) => API.get("/admin/audit-logs", { params });
