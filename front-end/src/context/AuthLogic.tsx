import React, {createContext,useContext,useState,useEffect} from "react";
import {User,DEFAULT_USERS} from "../types/users";

interface AuthContextType{
 user : User | null; //currently logged-in : user ; otherwise: null
 users : User[]; //list of registered users
 login : (email: string, password: string) => boolean; //login function takes in email & password; returns true if login successfully
 logout : () => void; //function to logout the user
}
 //create a context with AuthContextType structure; default value-> undefined (to be used within a provider)
 const AuthContext = createContext<AuthContextType | undefined>(undefined);


//this function wraps the application and provides the authentication state
export function AuthProvider(
    {children}:{children:React.ReactNode}
){
   //initial state -> null
    const [user , setUser] = useState< User | null >(null);  
//default value -> empty (empty array)
    const [users, setUsers] = useState<User[]>([]); 
                       
    //initialize users and current user on component mount
    useEffect(() => {
        //Retrieve users from local storage or use defaults
        const storedUsers = localStorage.getItem("users");
        //checks localStorage for stored users
        if(!storedUsers){ //if no user(s) exists
            //initialise them from DEFAULT_USERS (and add into the json file)
            localStorage.setItem("users",JSON.stringify(DEFAULT_USERS)); 
            setUsers(DEFAULT_USERS);
        }else{
            //otherwise load existing users
            setUsers(JSON.parse(storedUsers));
        }
        
        //check if there is any existing login (currentUser) 
        const currentUser = localStorage.getItem("currentUser");
        if(currentUser){
            setUser(JSON.parse(currentUser));
            // localStorage.removeItem("currentUser");
            // setUser(null);
            //logout of the session - after page is refreshed/close the window
        }

    },[]);

    //useEffect to keep users synced with localStorage
    useEffect(()=>{
        console.log("Users Updated: ", DEFAULT_USERS);
        if(users.length>0){
            //Whenever 'users' state changes, 
            localStorage.setItem("users",JSON.stringify(DEFAULT_USERS)); 
        }
    },[users]); //This will run whenever 'users' changes

    //login function
    const login = (email: string, password: string): boolean => {
        const foundUser = users.find( 
            //find a user with matching username & password
            (u) => u.email === email && u.password === password
        );

        //if match found
        if(foundUser){
            //update the state
            setUser(foundUser);
            //save logged-in user to localStorage (tell browser that this is the current user)
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    //logout function
    const logout = () => {
        //clear user state
        setUser(null); 
        //remove current user from local storage
        localStorage.removeItem("currentUser");
    };

    //wrapping children with AuthContext.provider, passing these values:
    return(
        <AuthContext.Provider value = {{user,users,login,logout}}>
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