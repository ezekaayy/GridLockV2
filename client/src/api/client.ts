import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`❌ Error ${status}:`, data?.message || "Unknown error");
    } else if (error.request) {
      console.error("❌ No response from server");
    } else {
      console.error("❌ Request setup error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
