import React from "react";
import  Header  from "../components/Header";
import Footer from "@/components/Footer";
import Home from "@/components/Home";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div>
        <Home />
      </div>
      <Footer />
    </div>
  );
}
