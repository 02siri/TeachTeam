import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    typeof window !== "undefined" && sessionStorage.getItem("isAdmin") === "true"
  );
 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isAdmin");
      if (stored === "true") setIsAdmin(true);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    const { username, password } = credentials;

    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      return true;
    }

    return false;
  };

  const logout = async () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
