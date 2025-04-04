import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BackGround_, Logo, Title, Google } from "../utils";
import { auth, googleProvider } from "../database/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import "../App.css";

const AccountLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email/Password Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out the required fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/categories");
    } catch (error) {
      setError("Invalid email or password.");
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful:", result.user);
      navigate("/categories");
    } catch (error) {
      setError("Google login failed. Please try again.");
      console.error("Google login error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Simple email validation function
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Games Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
        {/* Logo and Title */}
        <div className="flex flex-row gap-3 md:flex-col items-center">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-14 h-14 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
          <img src={Title} alt="Title" className="w-34 md:w-56" />
        </div>

        {/* Login Form */}
        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-md">
          <h1 className="text-white text-xl lg:text-2xl font-semibold mb-4">
            Login
          </h1>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Input */}
            <div>
              <label className="text-white block mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-white block mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#4426B9] hover:bg-[#341d8c] text-white font-semibold p-2 rounded-md transition duration-200"
              disabled={loading}
            >
              {loading ? "Loading..." : "Log In"}
            </button>

            {/* Forgot Password Link */}
            <p className="text-gray-400 text-center text-xs">
              <Link to="/forgot-password" className="underline text-blue-400">
                Forgotten Password?
              </Link>
            </p>

            <h5 className="text-white text-sm text-center">
              Join Ghost and discover thousands of gaming accounts for sale at
              your fingertips.
            </h5>

            {/* Create Account Button */}
            <Link to="/">
              <button
                type="button"
                className="w-full mt-5 border-2 border-gray-500 text-white text-xs font-medium p-2 rounded-md"
              >
                Create An Account
              </button>
            </Link>
          </form>

          {/* Google Login Button */}
          <div className="flex flex-col items-center mt-6 w-full">
            <p className="text-white text-sm mb-2">OR</p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center p-2 bg-white text-gray-800 rounded-md shadow-md hover:bg-gray-100 transition duration-200"
              disabled={loading}
            >
              <img src={Google} alt="Google Logo" className="w-6 h-6 mr-2" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-xs text-white text-center">
        Copyright &copy; {new Date().getFullYear()} All rights reserved.
      </p>
    </div>
  );
};

export default AccountLogin;
