import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const clerk = (window as any).Clerk;
  if (clerk?.session) {
    const token = await clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
