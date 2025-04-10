import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackGround_, Logo, Title } from "../utils";
import { auth, db } from "../database/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, Timestamp, collection, getDoc } from "firebase/firestore";

const AccountSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [email, setEmail] = useState(state?.email || "");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch user location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Failed to fetch location");
        const data = await response.json();
        setCountry(data.country_name || "Unknown");
        setCurrency(data.currency || "USD");
      } catch (error) {
        console.error("Error fetching location:", error);
        setCountry("Unknown");
        setCurrency("USD");
      }
    };
    fetchLocation();
  }, []);

  // Password validation
  const validatePassword = (pwd) => {
    setPassword(pwd);
    if (!pwd || pwd.length < 8) {
      setPasswordStrength("Too short! Minimum 8 characters.");
    } else if (
      !/[A-Za-z]/.test(pwd) ||
      !/\d/.test(pwd) ||
      !/[!@#$%^&*]/.test(pwd)
    ) {
      setPasswordStrength("Weak - Use letters, numbers & special characters.");
    } else {
      setPasswordStrength("Strong");
    }
  };

  // Email validation
  const validateEmailFormat = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    const domain = email.split("@")[1];
    if (!allowedDomains.includes(domain)) {
      return "Please use a supported email domain (e.g., gmail.com, yahoo.com).";
    }
    return "";
  };

  // Check if email is linked to a Google account
  const isGoogleAccount = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.includes("google.com");
    } catch (error) {
      console.error("Error checking sign-in methods:", error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setPasswordError(false);

    // Validate username
    if (!username.trim() || username.length < 3) {
      setErrorMessage("Please enter a valid username (minimum 3 characters).");
      return;
    }

    // Validate email
    const emailValidationError = validateEmailFormat(email);
    if (emailValidationError) {
      setErrorMessage(emailValidationError);
      return;
    }

    // Handle Google-authenticated user
    if (state?.email && auth.currentUser) {
      if (!isChecked) {
        setErrorMessage("You must agree to the terms and conditions.");
        return;
      }

      setLoading(true);

      try {
        // Check if username is taken
        const usernameRef = doc(db, "usernames", username.trim());
        const usernameSnap = await getDoc(usernameRef);
        if (usernameSnap.exists()) {
          setErrorMessage("Username is already taken. Please choose another.");
          setLoading(false);
          return;
        }

        // Save user profile to Firestore
        const userDoc = {
          uid: auth.currentUser.uid,
          email,
          username,
          country,
          currency,
          createdAt: Timestamp.now(),
        };
        await setDoc(doc(db, "users", auth.currentUser.uid), userDoc);

        // Reserve the username
        await setDoc(usernameRef, { uid: auth.currentUser.uid });

        localStorage.setItem("currency", currency);
        alert("Account created successfully!");
        navigate("/categories");
      } catch (error) {
        if (error.code === "permission-denied") {
          setErrorMessage(
            "Permission denied. Please try again or contact support."
          );
        } else {
          setErrorMessage("Failed to save profile. Please try again.");
        }
        console.error("Profile save error:", error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Email/password validation
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(true);
      setErrorMessage("Passwords do not match.");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (passwordStrength !== "Strong") {
      setErrorMessage("Your password is too weak.");
      return;
    }

    if (!isChecked) {
      setErrorMessage("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      // Check if email is linked to a Google account
      const googleAccount = await isGoogleAccount(email);
      if (googleAccount) {
        setErrorMessage(
          "This email is linked to a Google account. Please use Google sign-in."
        );
        setLoading(false);
        return;
      }

      // Check if username is taken
      const usernameRef = doc(db, "usernames", username.trim());
      const usernameSnap = await getDoc(usernameRef);
      if (usernameSnap.exists()) {
        setErrorMessage("Username is already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // Create new user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user data to Firestore
      const userDoc = {
        uid: user.uid,
        email,
        username,
        country,
        currency,
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, "users", user.uid), userDoc);

      // Reserve the username
      await setDoc(usernameRef, { uid: user.uid });

      localStorage.setItem("currency", currency);
      alert("Account created successfully!");
      navigate("/categories");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("Email already in use. Please log in instead.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format.");
          break;
        case "auth/weak-password":
          setErrorMessage("Password is too weak.");
          break;
        case "auth/too-many-requests":
          setErrorMessage("Too many attempts. Please try again later.");
          break;
        case "permission-denied":
          setErrorMessage(
            "Permission denied. Please try again or contact support."
          );
          break;
        default:
          setErrorMessage("An unexpected error occurred. Please try again.");
          console.error("Sign-up error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-auto">
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
            Finish Account Set-Up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
                required
              />
            </div>

            {!state?.email && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className={`w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 ${
                state?.email ? "opacity-50" : ""
              }`}
              required={!state?.email}
              disabled={state?.email}
            />
            <p
              className={`text-sm ${
                passwordStrength === "Strong"
                  ? "text-green-400"
                  : "text-red-400"
              } ${state?.email ? "opacity-50" : ""}`}
            >
              {passwordStrength ||
                (state?.email ? "Not required for Google accounts" : "")}
            </p>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 ${
                state?.email ? "opacity-50" : ""
              }`}
              required={!state?.email}
              disabled={state?.email}
            />
            {passwordError && (
              <p className="text-red-500 text-sm">Passwords do not match.</p>
            )}

            <input
              type="text"
              value={`${country} (${currency})`}
              className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
              readOnly
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <label htmlFor="terms" className="text-white text-sm">
                I agree to the
              </label>
              <a
                href="/privacy"
                className="text-blue-500 cursor-pointer underline"
              >
                Terms & Conditions
              </a>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md mt-4"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSetup;
