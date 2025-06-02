import React, { createContext, useContext, useEffect, useState } from "react";
import {gql, useMutation} from "@apollo/client";
import { useRouter } from "next/router";

const LOGIN = gql `
mutation Login($username: String! , $password: String!){
login(username: $username, password: $password)
}
`;

interface AuthContextType {
  isAdmin: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginMutation] = useMutation(LOGIN);
 const router = useRouter();


  useEffect(() => {
    const stored = sessionStorage.getItem("isAdmin");
    if (stored === "true") 
      setIsAdmin(true);
  }, []);

  const login = async ({username, password}: { username: string; password: string })=> {
    try{
    const res = await loginMutation({variables: {username, password}});
    const success = res.data?.login;
    if(success){
      sessionStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      return true;
    }
  }catch(error){
    console.error("Login Error: ", error);
  }
  return false;
};

  const logout = async () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
    router.push("/login");
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
