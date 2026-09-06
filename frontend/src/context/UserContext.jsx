/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { getProfile, logout as logoutService } from "../services/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await getProfile();
      setUser(res.data.data || null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // If token is invalid or expired, clear it
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
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
