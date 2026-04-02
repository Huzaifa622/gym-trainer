"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { logout as apiLogout } from "@/lib/api";

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) setAccessToken(token);
  }, []);

  const setTokens = (token: string) => {
    Cookies.set("accessToken", token, { expires: 1 });
    setAccessToken(token);
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    Cookies.remove("accessToken");
    setAccessToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ accessToken, isAuthenticated: !!accessToken, setTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
