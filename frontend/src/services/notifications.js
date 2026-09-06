import API from "./api";

export const getNotifications = (params = {}) => API.get("/notifications", { params });

export const getUnreadCount = () => API.get("/notifications/unread-count");

export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);

export const markAllAsRead = () => API.patch("/notifications/read-all");
