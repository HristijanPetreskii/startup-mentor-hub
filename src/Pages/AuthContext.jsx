// src/Pages/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // { id, email, role }
  const [token, setToken] = useState("");          // JWT
  const [loading, setLoading] = useState(true);

  // Rehydrate на старт (+ миграција од legacy keys)
  useEffect(() => {
    try {
      // 1) Нов формат
      let parsed = null;
      const raw = localStorage.getItem("auth");
      if (raw) {
        try { parsed = JSON.parse(raw); } catch { /* ignore */ }
      }

      // 2) Legacy формат (user/token од постари страници)
      if (!parsed) {
        const legacyUser = localStorage.getItem("user");
        const legacyToken = localStorage.getItem("token");
        if (legacyUser && legacyToken) {
          parsed = { user: JSON.parse(legacyUser), token: legacyToken };
          // мигрирај на нов клуч
          localStorage.setItem("auth", JSON.stringify(parsed));
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }

      if (parsed?.user && parsed?.token) {
        setUser(parsed.user);
        setToken(parsed.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Држи го Authorization header-от синхронизиран со token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Auto-logout ако добиеме 401 од сервер
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          try { localStorage.removeItem("auth"); } catch {}
          setUser(null);
          setToken("");
          delete axios.defaults.headers.common["Authorization"];
          alert("Session expired. Please login again.");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  const login = (userObj, jwt) => {
    setUser(userObj);
    setToken(jwt);
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    localStorage.setItem("auth", JSON.stringify({ user: userObj, token: jwt }));
  };

  const logout = () => {
    setUser(null);
    setToken("");
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth");
  };

  // Удобни помошни полиња за компоненти
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isMentor: user?.role === "mentor",
      isStartup: user?.role === "startup",
      authHeader: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
