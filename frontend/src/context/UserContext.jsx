/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { getProfile, logout as logoutService } from "../services/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await getProfile();
      setUser(res.data.data || null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // If token is invalid, expired, or rejected, clear local state
      const status = err.response?.status;
      if (status === 401 || status === 403 || status === 500) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: fetchUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
