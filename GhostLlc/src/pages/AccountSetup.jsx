import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackGround_, Logo, Title } from "../utils";
import { useAuth } from "../components/AuthContext"; // Update this path
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
  const { completeUserSetup } = useAuth(); // Use auth context for setup

  const [email, setEmail] = useState(state?.email || "");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("United States");
  const [currency, setCurrency] = useState("USD");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Fetch user location - with better error handling and caching
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Try to use cached location first
        const cachedLocation = localStorage.getItem("userLocation");
        if (cachedLocation) {
          const locationData = JSON.parse(cachedLocation);
          setCountry(locationData.country || "United States");
          setCurrency(locationData.currency || "USD");
          return;
        }

        // If no cache, make API request with proper error handling
        const response = await fetch("https://api.ipregistry.co/?key=tryout", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }

        const data = await response.json();

        // Set country and currency based on the API response
        const countryName = data.location?.country?.name || "United States";
        const currencyCode = data.currency?.code || "USD";

        setCountry(countryName);
        setCurrency(currencyCode);

        // Cache the result
        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            country: countryName,
            currency: currencyCode,
          })
        );
      } catch (error) {
        console.error("Error fetching location, using defaults:", error);
        // Fallback to defaults
        setCountry("United States");
        setCurrency("USD");
      }
    };

    fetchLocation();
  }, []);

  // Check username availability after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim().length >= 3) {
        validateUsername(username);
      } else {
        setUsernameAvailable(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [username]);

  // Username validation with feedback
  const validateUsername = async (username) => {
    if (!username.trim() || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameAvailable(isAvailable);
    } catch (error) {
      console.error("Error validating username:", error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

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

  // Function to check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      const usernameRef = doc(db, "usernames", username.trim());
      const usernameSnap = await getDoc(usernameRef);
      return !usernameSnap.exists(); // Return true if username is available
    } catch (error) {
      console.error("Error checking username:", error);
      // This is an actual Firebase error, not just a non-existent username
      throw new Error("Failed to check username availability");
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

    // Final username availability check
    if (usernameAvailable === false) {
      setErrorMessage("Username is already taken. Please choose another.");
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
        // Final check if username is available
        const isUsernameAvailable = await checkUsernameAvailability(username);
        if (!isUsernameAvailable) {
          setErrorMessage("Username is already taken. Please choose another.");
          setLoading(false);
          return;
        }

        // Prepare user data
        const userDoc = {
          uid: auth.currentUser.uid,
          email,
          username: username.trim(),
          country,
          currency,
          createdAt: Timestamp.now(),
          setupComplete: true,
        };

        // First create the username reservation
        await setDoc(doc(db, "usernames", username.trim()), {
          uid: auth.currentUser.uid,
        });

        // Then update the user document using our auth context
        const success = await completeUserSetup(userDoc);

        if (success) {
          localStorage.setItem("currency", currency);
          alert("Account created successfully!");
          // Auth context will handle navigation
        } else {
          throw new Error("Failed to complete user setup");
        }
      } catch (error) {
        console.error("Profile save error:", error.message);
        if (error.code === "permission-denied") {
          setErrorMessage(
            "Permission denied. Please try again or contact support."
          );
        } else {
          setErrorMessage(`Failed to save profile: ${error.message}`);
        }
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

      // Final check if username is available
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
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
        username: username.trim(),
        country,
        currency,
        createdAt: Timestamp.now(),
        setupComplete: true,
      };

      // First create the username reservation
      await setDoc(doc(db, "usernames", username.trim()), { uid: user.uid });

      // Then create the user document
      await completeUserSetup(userDoc);

      localStorage.setItem("currency", currency);
      alert("Account created successfully!");
      // Auth context will handle navigation
    } catch (error) {
      console.error("Sign-up error:", error.message);
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
          setErrorMessage(`An unexpected error occurred: ${error.message}`);
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
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2 bg-[#161B22] text-white rounded-md border 
                ${
                  usernameAvailable === true
                    ? "border-green-500"
                    : usernameAvailable === false
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                required
              />
              {checkingUsername && (
                <span className="text-xs text-gray-400 block mt-1">
                  Checking availability...
                </span>
              )}
              {usernameAvailable === true && username.trim().length >= 3 && (
                <span className="text-xs text-green-500 block mt-1">
                  Username available!
                </span>
              )}
              {usernameAvailable === false && (
                <span className="text-xs text-red-500 block mt-1">
                  Username already taken
                </span>
              )}
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
