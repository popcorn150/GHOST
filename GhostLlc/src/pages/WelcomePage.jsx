import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  facebookProvider,
  googleProvider,
} from "../database/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { BackGround_, Facebook, Google, Logo, Title } from "../utils";

const WelcomePage = () => {
  const navigate = useNavigate();

  // External API call to detect country
  const fetchCountry = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country_name;
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown";
    }
  };

  // This function is called only when the user clicks a sign-in button
  const checkUserAndNavigate = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      // Update Firestore with country if not set
      if (!userSnapshot.data().country) {
        const detectedCountry = await fetchCountry();
        await setDoc(userRef, { country: detectedCountry }, { merge: true });
      }
      console.log("Existing user, navigating to /categories...");
      navigate("/categories");
    } else {
      console.log("New user detected, saving data...");
      const detectedCountry = await fetchCountry();
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        country: detectedCountry,
      });
      console.log("New user saved, navigating to /categories...");
      navigate("/categories");
    }
  };

  // Sign-in handler triggered when the user clicks one of the sign-in buttons
  const handleSignIn = async (providerType) => {
    const provider =
      providerType === "google" ? googleProvider : facebookProvider;
    try {
      const result = await signInWithPopup(auth, provider);
      await checkUserAndNavigate(result.user);
    } catch (error) {
      console.error("Sign-in error:", error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#010409]">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative flex flex-col items-center gap-10 px-6 md:flex-row md:gap-20">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <img src={Logo} alt="Ghost Logo" className="w-28 md:w-36 lg:w-40" />
          <img src={Title} alt="Title" className="w-40 md:w-56" />
        </div>

        {/* Sign-In Section */}
        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-10 lg:p-12 rounded-xl w-full max-w-sm md:max-w-md shadow-md">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-white font-semibold mb-5">
            Sign In
          </h1>

          {/* Google Sign-In */}
          <button
            onClick={() => handleSignIn("google")}
            className="w-full flex items-center justify-center p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md transition duration-300 mt-4"
          >
            <img src={Google} alt="Google Logo" className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Continue with Google</span>
          </button>

          {/* Facebook Sign-In */}
          <button
            onClick={() => handleSignIn("facebook")}
            className="w-full flex items-center justify-center p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md transition duration-300 mt-3"
          >
            <img src={Facebook} alt="Facebook Icon" className="w-6 h-6 mr-2" />
            <span className="text-base font-medium">
              Continue with Facebook
            </span>
          </button>

          {/* Login Navigation */}
          <p className="text-white text-sm mt-6">Already have an account?</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full text-white border border-gray-500 text-sm font-medium p-2 rounded-md hover:bg-gray-300 transition mt-2"
          >
            Log In
          </button>

          {/* Terms & Policy */}
          <p className="text-gray-400 text-xs mt-5 text-center">
            <a href="/privacy" className="text-blue-400 hover:underline">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-xs text-white text-center">
        Copyright &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
};

export default WelcomePage;
