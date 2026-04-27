import React, { createContext, useContext, useState, useEffect } from "react";
import { type JwtPayload } from "@/types/Auth";
import { decodeToken, isTokenValid } from "@/utils/Auth";

interface AuthContextType {
  user: JwtPayload | null;
  token: string | null;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<JwtPayload | null>(() => {
    const t = localStorage.getItem("token");
    return t && isTokenValid(t) ? decodeToken(t) : null;
  });

  useEffect(() => {
    if (token && isTokenValid(token)) {
      setUser(decodeToken(token));
      localStorage.setItem("token", token);
    } else {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }, [token]);

  const login = (newToken: string, refreshToken?: string) => {
    setToken(newToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
