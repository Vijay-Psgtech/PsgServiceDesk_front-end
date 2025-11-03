import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

let inMemoryAuth = { accessToken: null, user: null };
export function getAuth() {
  return inMemoryAuth;
}
export function setAuth(data) {
  inMemoryAuth = { ...inMemoryAuth, ...data };
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getAuth());

  const login = (accessToken, user) => {
    setAuth({ accessToken, user });
    setAuthState({ accessToken, user });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAuth({ accessToken: null, user: null });
      setAuthState({ accessToken: null, user: null });
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await api.post("/auth/refresh");
        const { accessToken, user } = res.data;
        login(accessToken, user);
      } catch (error) {
        console.error("Refresh token failed: ", error);
      } finally {
        setLoading(false);
      }
    };
    tryRefresh();
  }, []);

  if (loading) return <div>Loading...</div>

  return (
    <AuthContext.Provider value={{ auth: authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);