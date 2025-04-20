import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BackGround_, Logo, Title, Google } from "../utils";
import { auth, googleProvider } from "../database/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import "../App.css";

const AccountLogin = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  // Simple email validation function
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

    //Email/Username Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    
    // Validate inputs
    if (!emailOrUsername.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      let userEmail = emailOrUsername;

      // If input is not a valid email, treat it as a username
      if (!validateEmail(emailOrUsername)) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("auth/user-not-found");
        }

        if (querySnapshot.size > 1) {
          throw new Error(
            "Multiple users found with this username. Please contact support."
          );
        }

        userEmail = querySnapshot.docs[0].data().email;
        if (!validateEmail(userEmail)) {
          throw new Error("Invalid email retrieved from database.");
        }
      }

      // Log for debugging
      console.log("Attempting login with email:", userEmail);
      console.log("Password length:", password.length);

      // Attempt login
      await signInWithEmailAndPassword(auth, userEmail, password);
      alert("Login successful!");
      navigate("/categories");
      const from = location.state?.from || '/store';
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error.message);
      switch (error.message) {
        case "auth/user-not-found":
          setError("User not found. Check your email or username, or sign up.");
          break;
        case "Multiple users found with this username. Please contact support.":
          setError(error.message);
          break;
        case "Invalid email retrieved from database.":
          setError("Invalid email data. Please contact support.");
          break;
        default:
          if (error.code === "auth/wrong-password") {
            setError("Incorrect password. Please try again.");
          } else if (error.code === "auth/invalid-email") {
            setError("Invalid email format. Please enter a valid email.");
          } else if (error.code === "auth/invalid-credential") {
            setError("Invalid credentials. Please check your input.");
          } else if (error.code === "auth/too-many-requests") {
            setError("Too many attempts. Please try again later.");
          } else if (error.code === "auth/user-disabled") {
            setError("This account has been disabled.");
          } else {
            setError("Login failed. Please try again.");
          }
      }
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
      const signedInUser = result.user;

      if (!signedInUser || !signedInUser.email) {
        throw new Error("No user or email returned from Google sign-in.");
      }

      // Check if user document exists in Firestore
      const userRef = doc(db, "users", signedInUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        // Existing user, proceed to categories
        navigate("/categories");
      } else {
        // New user, throw error and prompt to go back to Welcome page
        throw new Error(
          "No account found. Please return to the Welcome page to sign up."
        );
      }
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was canceled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups and try again.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setError(
          "Account exists with a different sign-in method. Try another method."
        );
      } else {
        // Custom error for new users
        setError(
          error.message ||
            "Google sign-in failed. Please return to the Welcome page."
        );
      }
    } finally {
      setLoading(false);
    }
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

      <div className="relative my-5 flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
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
            {/* Email/Username Input */}
            <div>
              <label className="text-white block mb-1">Email or Username</label>
              <input
                type="text"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
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

            <h5 className="text-white text-xs text-center">
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
    </div>
  );
};

export default AccountLogin;
