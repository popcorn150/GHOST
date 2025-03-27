import "../App.css";
import { useState } from "react";
import { BackGround_, Logo, Title } from "../utils";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../database/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const AccountLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out the required fields");
      return;
    }

    setLoading(true);

    try {
      // Sign in user with email and password
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

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Games Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
        <div className="flex flex-row gap-3 md:flex-col items-center">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-14 h-14 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
          <img src={Title} alt="Title" className="w-34 md:w-56" />
        </div>

        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-md">
          <h1 className="text-white text-xl lg:text-2xl font-semibold mb-4">
            Login
          </h1>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-white block mb-1">Email Address</label>
              <input
                type="email"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-white block mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4426B9] hover:bg-[#341d8c] text-white font-semibold p-2 rounded-md transition duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="text-gray-400 text-center text-xs">
              <a href="#" className="no-underline">
                Forgotten Password?
              </a>
            </p>

            <h5 className="text-white text-sm text-center">
              Join Ghost and discover thousands of gaming accounts for sale at
              your fingertips.
            </h5>

            <Link to="/">
              <button
                type="button"
                className="w-full mt-5 border-2 border-gray-500 text-white text-xs font-medium p-2 rounded-md"
              >
                Create An Account
              </button>
            </Link>
          </form>
        </div>
      </div>

      <p className="absolute bottom-5 text-xs text-white text-center">
        Copyright &copy; 2025 All rights reserved.
      </p>
    </div>
  );
};

export default AccountLogin;
