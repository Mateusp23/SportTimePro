import axios from "axios";
import { useAuthStore } from "@/app/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
});

// Anexa Authorization se houver token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  console.log('🔍 API Interceptor - Token:', token ? 'Presente' : 'Ausente');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
