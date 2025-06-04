import React from "react";

//reusing the same thingy from TeachTeam..
const Footer = () => {
    return (
      <footer className="bg-gradient-to-br from-blue-900 to-black text-white py-6 px-4 text-center font-roboto font-semibold text-base md:text-lg">
        <p className="mb-1">
          Designed & Developed by <span className="text-blue-300">Srishti</span> and <span className="text-blue-300">Sruthy</span>
          </p>
          <p className="text-gray-400">
             © {new Date().getFullYear()} TeachTeam. All rights reserved.
             </p>
        </footer>
    
    );
  };
  
  export default Footer;