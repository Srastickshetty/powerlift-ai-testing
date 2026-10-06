import axios from "axios";
import { auth } from "../auth/firebase";

const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD 
  ? "https://powerlift-ai-backend.onrender.com/api" 
  : "http://localhost:5001/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor: Attach fresh Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth?.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("[API]: Failed to fetch fresh ID token:", err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (expired/revoked session) and 403 (unauthorized access)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[API]: 401 Unauthorized — triggering session expired handler.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("powerlift:session-expired", {
          detail: { originalUrl: error.config?.url }
        }));
      }
    } else if (error.response?.status === 403) {
      console.warn("[API]: 403 Forbidden — access to resource is restricted.");
    }
    return Promise.reject(error);
  }
);

export default api;
