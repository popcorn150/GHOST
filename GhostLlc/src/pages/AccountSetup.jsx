import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackGround_, Logo, Title } from "../utils";
import { auth, db } from "../database/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";

const AccountSetup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch User Location (Country & Currency)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
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

  // Password Strength Validation
  const validatePassword = (pwd) => {
    setPassword(pwd);
    if (pwd.length < 8) {
      setPasswordStrength("Too short!");
    } else if (
      !/[A-Za-z]/.test(pwd) ||
      !/\d/.test(pwd) ||
      !/[!@#$%^&*]/.test(pwd)
    ) {
      setPasswordStrength("Weak - Use letters, numbers & special characters");
    } else {
      setPasswordStrength("Strong");
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter an email and password.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(true);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (passwordStrength !== "Strong") {
      setErrorMessage(
        "Your password is too weak. Please choose a stronger password."
      );
      return;
    }

    if (!isChecked) {
      setErrorMessage("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save User Details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        country,
        currency,
        createdAt: Timestamp.now(),
      });

      localStorage.setItem("currency", currency);
      alert("Account created successfully!");
      navigate("/categories");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email already in use. Try logging in instead.");
        try {
          // Attempt to log in if email is already registered
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          console.log("User logged in:", userCredential.user);
          navigate("/categories");
        } catch (loginError) {
          setErrorMessage("Incorrect password. Try resetting your password.");
        }
      } else {
        setErrorMessage("An error occurred. Please try again.");
        console.error("Error signing up:", error.message);
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
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
              required
            />
            <p
              className={`text-sm ${
                passwordStrength === "Strong"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {passwordStrength}
            </p>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600"
              required
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
                I agree to the{" "}
                <span className="text-blue-500 cursor-pointer underline">
                  Terms & Conditions
                </span>
              </label>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold p-2 rounded-md transition ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#4426B9] text-white"
              }`}
            >
              {loading ? "Creating Account..." : "Proceed"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSetup;
