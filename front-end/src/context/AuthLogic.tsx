import React, {createContext,useContext,useState,useEffect} from "react";
// import {User,DEFAULT_USERS} from "../types/users";
import { authApi, User as ApiUser } from "@/services/api";
import { useRouter } from "next/router";

interface AuthContextType{
 user : ApiUser | null; //currently logged-in : user ; otherwise: null
 login : (credentials: {email: string, password: string}) => Promise<boolean>; //login function takes in email & password; returns true if login successfully
 logout : () => Promise<void>; //function to logout the user
}
 //create a context with AuthContextType structure; default value-> undefined (to be used within a provider)
 const AuthContext = createContext<AuthContextType | undefined>(undefined);


//this function wraps the application and provides the authentication state
export function AuthProvider(
    {children}:{children:React.ReactNode}
){
   //initial state -> null
    const [user , setUser] = useState< ApiUser | null >(null);  
    const router = useRouter();
                       
    //initialize users and current user on component mount
    useEffect(() => {
        const checkCurrentUser = async () => {
            try{
                const currentUserData = await authApi.getCurrentUser();
                if(currentUserData){
                    setUser(currentUserData);
                }
            }catch(error){
                console.log("Error checking user ", error);
            }
        };

        checkCurrentUser();
    },[]);

    //login function
    const login = async (credentials: {email: string, password: string}): Promise<boolean> => {
        try{
            const response = await authApi.login(credentials);
            if(response.user){
                setUser(response.user);
                return true;
            }
            return false;
        }catch(error){
            console.log("Login failed: ", error);
            return false;
        }
    };

    //logout function
    const logout =  async () => {
        try{
            await authApi.logout();
            setUser(null);
            router.push("/login");
        }catch(error){
            console.log("Logout Failed: ", error);
        }
    };

    //wrapping children with AuthContext.provider, passing these values:
    return(
        <AuthContext.Provider value = {{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    );
}

//custom hook for accessing AuthContext
export function useAuth(){
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}