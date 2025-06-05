import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/Authlogic";
import { useRouter } from "next/router";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md text-white font-roboto font-bold p-2">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/*same logo reusing here*/}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo1.png"
            alt="TeachTeam Logo"
            width={120}
            height={60}
            className="cursor-pointer"
          />
        </Link>

        {/* This is for responsiveness.. */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/*All nav links*/}
        <ul
        className={`${
          menuOpen ? "flex" : "hidden"
          } absolute top-20 left-0 w-full flex-col items-center space-y-6 bg-black/90 text-base font-medium md:flex md:static md:flex-row md:space-y-0 md:space-x-6 md:bg-transparent md:p-0 md:justify-center`}
          >
          <li>
            <Link
              href="/"
              className="px-4 py-2 rounded-full transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
            >
              Home
            </Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link
                  href="/course"
                  className="px-4 py-2 rounded-full transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                >
                  Manage Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/assign"
                  className="px-4 py-2 rounded-full transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                >
                  Assign Lecturers
                </Link>
              </li>
              <li>
                <Link
                  href="/block-users"
                  className="px-4 py-2 rounded-full transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                >
                  Block Users
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="px-4 py-2 rounded-full transition-all duration-300 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(173,216,230,0.8)]"
                >
                  Reports
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* if admin login successful or not.. I couldn't fix this links space... and style yet.. */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          {isAdmin ? (
            <>
              <span className="text-white font-semibold text-sm tracking-wide font-playfair italic px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm hover:shadow-[0_0_10px_rgba(173,216,230,0.4)] transition duration-300">
                Welcome, Admin!
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-white border border-red-500 transition duration-300 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.5)]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login"
              className="px-4 py-2 rounded-full text-white border border-red-500 transition duration-300 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.5)]"
              >
                Login
              
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
