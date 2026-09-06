import API from "./api";

export const getTrendingPosts = (params = {}) => API.get("/explore/trending", { params });

export const getTrendingHashtags = (limit = 10) =>
  API.get("/explore/hashtags", { params: { limit } });

export const getTrending = getTrendingHashtags;

export const getPostsByHashtag = (tag, params = {}) =>
  API.get(`/explore/hashtags/${tag}`, { params });

export const globalSearch = (q) => API.get("/explore/search", { params: { q } });
