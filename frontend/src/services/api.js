import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Chỉ set JSON khi KHÔNG phải FormData
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"]; // để browser tự set boundary
  }
  return config;
});
