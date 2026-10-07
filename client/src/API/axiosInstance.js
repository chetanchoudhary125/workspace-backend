import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// One shared in-flight refresh promise so parallel 401s don't fire N refreshes.
let refreshPromise = null;

const isAuthEndpoint = (url) => {
  const path = url?.split("?")[0].replace(/\/+$/, "");
  return [
    "/auth/login",
    "/auth/register",
    "/auth/logout",
    "/auth/refresh",
    "/auth/refresh-token",
  ].some((endpoint) => path?.endsWith(endpoint));
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      original?._retry ||
      isAuthEndpoint(original?.url)
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
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
