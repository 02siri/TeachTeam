import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/Authlogic";

const Header = () => {
  const { isAdmin, logout } = useAuth(); 

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md text-white text-xl font-roboto font-bold p-4">
      <nav className="flex justify-between items-center">
        {/* Logo */}
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

        {/* Admin Tools */}
        {isAdmin && (
          <ul className="flex items-center space-x-4 ml-auto mt-4 md:mt-0">
            <li>
              <Link href="/course">
                <button className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                  Manage Courses
                </button>
              </Link>
            </li>
            <li>
              <Link href="/assign">
                <button className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                  Assign Lecturers
                </button>
              </Link>
            </li>
            <li>
              <Link href="/block-users">
                <button className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                  Block Users
                </button>
              </Link>
            </li>
            <li>
              <Link href="/reports">
                <button className="px-4 py-2 rounded-full relative text-white transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]">
                  Reports
                </button>
              </Link>
            </li>
          </ul>
        )}

        {/* Auth Buttons */}
        <ul className="flex items-center space-x-4 ml-auto mt-4 md:mt-0">
          {isAdmin ? (
            <li>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.5)] cursor-pointer"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.5)] cursor-pointer"
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
