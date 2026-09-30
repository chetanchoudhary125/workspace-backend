import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../API/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    axiosInstance
      .get("/auth/profile")
      .then((res) => {
        if (mounted) setUser(res.data.user);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const register = async (name, email, password) => {
    await axiosInstance.post("/auth/register", { name, email, password });
    const res = await axiosInstance.get("/auth/profile");
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    await axiosInstance.post("/auth/login", { email, password });
    const res = await axiosInstance.get("/auth/profile");
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
