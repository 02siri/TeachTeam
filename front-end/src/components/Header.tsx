import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthLogic";
import { useRouter } from "next/router";

//header component..
//this component is responsible for rendering the header of the page....
//it includes the logo, navigation links, and user authentication buttons...
//it also includes the logic for displaying different links based on user roles (student or staff)...
//it uses the useAuth hook to get the current user and logout function...
const Header = () => {

  //useAuth hook to get the current user and logout function
  //this hook is defined in the AuthLogic.tsx file in the context folder...
  const {currentUserEmail, currentUsername, logout} = useAuth();
  const router = useRouter();

  //Function to extract the name from the email address
  //this function takes the email address as input and returns the name part before the '@' symbol...
  //it also capitalizes the first letter of the name...
  //if the email address is empty, it returns "Guest" as the default name...
  //this function is used to display the welcome message in the header...
  // const extractName = (email: string) => {
  //     if (!email) return "Guest";
  //       //Get the name part before the '@' symbol
  //       const namePart = email.split("@")[0];
  //       //Capitalize first letter
  //       return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  //   }
  
  const handleLogout = () =>{
    logout();
    router.push("/login");
  }
  

  return (
    //Header component with a fixed position at the top of the page...
    //it includes a logo, navigation links, and user authentication buttons...
    <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md text-white text-xl font-roboto font-bold p-4">
      <nav className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">

          <Image
          src="/logo1.png"
          alt="TeachTeam Logo"
          width={120}
          height={60}
          className="cursor-pointer"
          />
          </Link>
        </div>

        {/* Navigation links */}
        {/* The links are displayed in a flex container with space between them */}
        {/* The links are conditionally rendered based on the user role (student or staff) */}
        <ul className="flex flex-grow justify-center space-x-20">
          <li>
            <Link 
            href="/" 
            className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
            >Home
            </Link>
            </li>
          {currentUserEmail && (
              <>
              {currentUserEmail.endsWith("@student.rmit.edu.au") && (
                <li>
                  <Link 
                  href = "/tutor-dashboard"
                  className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                  >Tutor Dashboard
                  </Link>
                </li>
              )}

              {currentUserEmail.endsWith("@staff.rmit.edu.au") && (
                <li>
                  <Link 
                  href = "/lecturer-dashboard" 
                  className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                  >Lecturer Dashboard
                  </Link>
                </li>
              )}
              </>
              )}
        </ul>
        {/* User authentication buttons */}
        {/* If the user is logged in, a welcome message and logout button are displayed */}
        {/* If the user is not logged in, login and register buttons are displayed */}
        <ul className="flex space-x-4 ml-auto">
        {currentUsername ? (
                   //If user is logged in, show welcome msg and logout button
                   <div className = "flex items-center space-x-4">
                    
                    <span className="text-white font-semibold text-lg tracking-wide font-playfair italic px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm hover:shadow-[0_0_10px_rgba(173,216,230,0.4)] transition duration-300">
                        Welcome, {currentUsername}!
                      </span>

                      <button onClick={handleLogout} 
                      className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.5)] cursor-pointer">
                        Logout
                      </button>
                    </div>
                ) : (
                     //If user is not logged in, show login & register buttons
                    <>

                      <li>
                        <Link 
                        href = "/login"
                        className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                          Login
                        </Link>
                      </li>

                      <li>
                         <Link 
                         href = "/register"
                         className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                          Register
                          </Link>
                      </li>
                    </>
                    )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
