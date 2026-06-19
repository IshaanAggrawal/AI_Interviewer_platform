import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

/**
 * Custom hook to get an Axios instance with the Clerk JWT attached.
 * This should be used inside Client Components.
 */
export const useApiClient = (getToken: () => Promise<string | null>) => {
  // Add a request interceptor to inject the token
  api.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};

export default api;
