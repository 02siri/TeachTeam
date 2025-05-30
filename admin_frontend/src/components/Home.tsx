import { useAuth } from "../context/Authlogic";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative h-screen flex items-center justify-center text-white bg-black overflow-hidden">
        <div className="absolute left-[-150px] top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 opacity-20 blur-[160px] rounded-full z-0" />
        <div className="absolute right-[-150px] top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] bg-cyan-200 opacity-20 blur-[160px] rounded-full z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-white z-0 pointer-events-none" />

        <div className="relative container mx-auto flex flex-col-reverse md:flex-row justify-between items-center max-w-7xl">
          <div className="text-center md:text-left max-w-xl">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
              Welcome to <span className="text-blue-300">Teach Team</span>
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-blue-100">
              Admin portal for managing courses, lecturers, candidates and reports.
            </p>

            {isAdmin && (
              <div className="mt-8">
                <Link href="/course">
                  <button
                    className="relative inline-block text-white font-semibold py-3 px-8 rounded-full transition duration-300 group overflow-hidden shadow-lg border border-white cursor-pointer"
                    style={{
                      boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full transition-all duration-300"></span>
                    <span className="relative z-10">Manage Dashboard</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center">
            <Image src="/home.png" alt="Teach Team image" width={1200} height={1200} />
          </div>
        </div>
      </header>

      {!isAdmin && (
        <main
          className="flex-grow flex items-center justify-center min-h-screen w-full px-6 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        >
          <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
            <h2 className="text-4xl font-bold text-gray-800">Admin Access</h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Please sign in using admin credentials to access the dashboard and manage data.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <button
                  className="relative inline-block text-white font-semibold py-3 px-8 rounded-full transition duration-300 group overflow-hidden shadow-lg border border-white"
                  style={{ boxShadow: "0 0 15px rgb(71, 71, 71)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full transition-all duration-300"></span>
                  <span className="relative z-10">Login</span>
                </button>
              </Link>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
