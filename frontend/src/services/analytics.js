import API from "./api";

export const getCreatorAnalytics = (period = "30d") =>
  API.get("/analytics/me", { params: { period } });
