import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackGround_, Google, Logo, Title } from "../utils";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleGoogleSignIn = () => {
    navigate("/categories");
  };

  const handleSignUp = () => {
    navigate("/sign-up");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#010409] px-6">
      {/* Background */}
      <div className="absolute inset-0 opacity-50 z-0">
        <img
          src={BackGround_}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative my-5 z-10 flex flex-col items-center gap-7 md:flex-row md:gap-24 w-full max-w-5xl">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <img src={Logo} alt="Ghost Logo" className="w-30 md:w-44 lg:w-52" />
          <img src={Title} alt="Title" className="w-40 md:w-64 mt-6" />
        </div>

        {/* Sign-In Section */}
        <div className="flex flex-col items-center bg-[#010409] p-5 md:p-14 lg:p-16 rounded-xl w-full max-w-md md:max-w-lg shadow-2xl border border-gray-700">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-medium mb-5 text-center">
            Get Started
          </h1>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full gap-2 flex items-center justify-center p-4 
              bg-white hover:bg-gray-100 text-gray-800 
              rounded-lg shadow-md transition duration-300 
              mb-4 cursor-pointer text-base md:text-lg font-medium"
          >
            <img src={Google} alt="Google Logo" className="w-7 h-7" />
            <span className="text-sm text-black font-medium">
              Continue with Google
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center w-full">
              {error}
            </p>
          )}

          {/* Email Sign Up */}
          <button
            onClick={() => navigate("/sign-up")}
            className="w-full flex items-center justify-center p-4 
              bg-blue-600 hover:bg-blue-700 text-sm text-white 
              rounded-lg shadow-md transition duration-300 
              mb-4 cursor-pointer md:text-lg font-medium"
          >
            Sign Up with Email
          </button>

          {/* Login */}
          <p className="text-gray-400 text-base mt-4 mb-2">
            Already have an account?
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full text-white border border-gray-500 
              text-base font-medium p-3 
              rounded-lg mt-2"
          >
            Log In
          </button>

          <p className="text-gray-300 text-sm mt-5 gap-3 text-center">
            By signing up, you agree to our{" "}
            <a href="/privacy-policy" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 py-3">
        <h4 className="text-sm text-center text-gray-300">
          Copyright © {new Date().getFullYear()}. All rights reserved.
        </h4>
      </div>
    </div>
  );
};

export default WelcomePage;
