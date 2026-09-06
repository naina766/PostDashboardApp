import API from "./api";

export const submitReport = (data) => API.post("/reports", data);
export const getReports = (params = {}) => API.get("/reports", { params });
export const updateReportStatus = (id, status) => API.patch(`/reports/${id}/status`, { status });
