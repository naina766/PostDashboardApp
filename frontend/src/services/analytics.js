import API from "./api";

export const getCreatorAnalytics = () => API.get("/analytics/me");
