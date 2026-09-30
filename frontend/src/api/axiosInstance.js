import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// One shared in-flight refresh promise so parallel 401s don't fire N refreshes.
let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only handle expired-access-token 401s. Skip auth endpoints and retries.
    if (
      status !== 401 ||
      original?._retry ||
      original?.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axiosInstance.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      return axiosInstance(original);
    } catch (refreshError) {
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
