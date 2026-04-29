import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type JwtPayload } from "@/types/Auth";
import { decodeToken, isTokenValid } from "@/utils/Auth";
import api from "@/utils/api";

interface AuthContextType {
  user: JwtPayload | null;
  token: string | null;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  // SUPERUSER role switching
  isSuperuser: boolean;
  effectiveRole: string | null;
  switchRole: (role: string | null) => Promise<void>;
  isSwitchingRole: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<JwtPayload | null>(() => {
    const t = localStorage.getItem("token");
    return t && isTokenValid(t) ? decodeToken(t) : null;
  });
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

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

  // SUPERUSER: switch active role (null = reset to superuser view)
  const switchRole = useCallback(async (role: string | null) => {
    if (!user || user.role !== "superuser") return;
    setIsSwitchingRole(true);
    try {
      const res = await api.post<{ success: boolean; data: { token: string; refreshToken: string } }>(
        "/admin/switch-role",
        { activeRole: role }
      );
      if (res.data.success) {
        login(res.data.data.token, res.data.data.refreshToken);
      }
    } catch (err) {
      console.error("Role switch failed", err);
    } finally {
      setIsSwitchingRole(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSuperuser = user?.role === "superuser";
  const effectiveRole = isSuperuser ? (user?.activeRole ?? "superuser") : (user?.role ?? null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isSuperuser,
        effectiveRole,
        switchRole,
        isSwitchingRole,
      }}
    >
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
