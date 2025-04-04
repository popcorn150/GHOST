import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../database/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { BackGround_, Google, Logo, Title } from "../utils";

const WelcomePage = () => {
  const navigate = useNavigate();

  // Function to fetch user's country
  const fetchCountry = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Failed to fetch country");
      const data = await response.json();
      return data.country_name || "Unknown";
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown";
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          // If user does not exist, store their details
          const detectedCountry = await fetchCountry();
          const userData = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            createdAt: new Date().toISOString(),
            country: detectedCountry,
            authProvider: "google",
          };
          await setDoc(userRef, userData);
        }

        navigate("/categories");
      }
    } catch (error) {
      console.error("Sign-in error:", error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#010409] px-6">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50 z-0">
        <img
          src={BackGround_}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row md:gap-24 w-full max-w-5xl">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <img src={Logo} alt="Ghost Logo" className="w-32 md:w-44 lg:w-52" />
          <img src={Title} alt="Title" className="w-48 md:w-64 mt-6" />
        </div>

        {/* Sign-In Section (Updated to Navy Blue) */}
        <div className="flex flex-col items-center bg-[#010409] p-10 md:p-14 lg:p-16 rounded-xl w-full max-w-md md:max-w-lg shadow-2xl border border-gray-700">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-semibold mb-8 text-center">
            Get Started
          </h1>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center p-4 
            bg-white hover:bg-gray-100 text-gray-800 
            rounded-lg shadow-md transition duration-300 
            mb-4 cursor-pointer text-base md:text-lg font-medium"
          >
            <img src={Google} alt="Google Logo" className="w-7 h-7 mr-3" />
            <span>Continue with Google</span>
          </button>

          {/* Sign Up with Email */}
          <button
            onClick={() => navigate("/sign-up")}
            className="w-full flex items-center justify-center p-4 
            bg-blue-600 hover:bg-blue-700 text-white 
            rounded-lg shadow-md transition duration-300 
            mb-4 cursor-pointer text-base md:text-lg font-medium"
          >
            <span>Sign Up with Email</span>
          </button>

          {/* Login Navigation */}
          <p className="text-gray-400 text-lg mt-4 mb-2">
            Already have an account?
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full text-white border border-gray-500 
            hover:border-gray-400 text-base font-medium p-3 
            rounded-lg mt-2 cursor-pointer transition duration-300"
          >
            Log In
          </button>

          {/* Terms & Policy */}
          <p className="text-gray-300 text-sm mt-6 text-center">
            By signing up, you agree to our{" "}
            <a href="/privacy-policy" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 w-full text-center text-sm text-gray-300">
        Copyright © {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
};

export default WelcomePage;
