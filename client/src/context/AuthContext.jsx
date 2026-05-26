import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("hhfitclub_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("hhfitclub_token");

  useEffect(() => {
    if (!token) {
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        const nextUser = response.data.data.user;
        setUser(nextUser);
        localStorage.setItem("hhfitclub_user", JSON.stringify(nextUser));
      })
      .catch(() => {
        setUser(null);
      });
  }, [token]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", payload);
      const { token: nextToken, user: nextUser } = response.data.data;
      localStorage.setItem("hhfitclub_token", nextToken);
      localStorage.setItem("hhfitclub_user", JSON.stringify(nextUser));
      setUser(nextUser);
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", payload);
      const { token: nextToken, user: nextUser } = response.data.data;
      localStorage.setItem("hhfitclub_token", nextToken);
      localStorage.setItem("hhfitclub_user", JSON.stringify(nextUser));
      setUser(nextUser);
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hhfitclub_token");
    localStorage.removeItem("hhfitclub_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
