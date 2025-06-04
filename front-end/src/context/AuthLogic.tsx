import React, {createContext,useContext,useEffect,useState} from "react";
// import {User,DEFAULT_USERS} from "../types/users";
import { authApi} from "@/services/api";
import { useRouter } from "next/router";

interface AuthContextType{
 currentUserEmail : string | null; //currently logged-in : user ; otherwise: null
 currentUsername : string | null;
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
    const [currentUserEmail , setCurrentUserEmail] = useState< string | null >(
        //Check if we are running in a browser environment. 
        // If we are, try to get the value associated with the key 'currentUserEmail' from the session storage. 
        // If we are not in a browser environment, return null
        typeof window!== "undefined" ? sessionStorage.getItem("CurrentUserEmail") : null
    );  

     const [currentUsername , setCurrentUsername] = useState< string | null >(
        typeof window!== "undefined" ? sessionStorage.getItem("CurrentUsername") : null
    );  
    const router = useRouter();

     useEffect(()=>{
        if(typeof window!== "undefined"){
            const storedEmail = sessionStorage.getItem("CurrentUserEmail");
            const storedUsername = sessionStorage.getItem("CurrentUsername");
            if(storedEmail) setCurrentUserEmail(storedEmail);
            if(storedUsername) setCurrentUsername(storedUsername);
        }
    }, []);

    //login function
    const login = async (credentials: {email: string, password: string}): Promise<boolean> => {
        try{
            const response = await authApi.login(credentials);
            console.log("Login response: ", response);

            if(response.user && response.user.email && response.user.username){
                // if(response.user.isBlocked){
                //     throw new Error("Your account has been blocked. Please contact support.")
                // }
                sessionStorage.setItem("CurrentUserEmail", response.user.email);
                sessionStorage.setItem("CurrentUsername", response.user.username);
                setCurrentUserEmail(response.user.email);
                setCurrentUsername(response.user.username);
                return true;
            }
            throw new Error("Invalid email or password");
        }catch(error){
            console.log("Login failed: ", error);
            throw error;
        }
    };

    //logout function
    const logout =  async () => {
        sessionStorage.removeItem("CurrentUserEmail");
        sessionStorage.removeItem("CurrentUsername");
        setCurrentUserEmail(null);
        setCurrentUsername(null);
        router.push("/login");
    };

    //wrapping children with AuthContext.provider, passing these values:
    return(
        <AuthContext.Provider value = {{currentUserEmail,currentUsername,login,logout}}>
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