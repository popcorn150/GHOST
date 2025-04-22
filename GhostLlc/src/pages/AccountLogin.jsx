import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(`User already signed in: ${user.uid}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  const checkUserExists = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      console.log(`checkUserExists: UID=${uid}, Exists=${userDoc.exists()}`);
      return userDoc.exists();
    } catch (error) {
      console.error(`Error checking user existence for UID=${uid}:`, error);
      console.log("Assuming user exists due to error");
      return true; // Assume exists to allow login
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOrUsername.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      let userEmail = emailOrUsername;
      let userExists = false;

      if (!validateEmail(emailOrUsername)) {
        try {
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

          const userData = querySnapshot.docs[0].data();
          userEmail = userData.email;

          if (!validateEmail(userEmail)) {
            throw new Error("Invalid email retrieved from database.");
          }

          userExists = true;
        } catch (firestoreError) {
          if (
            firestoreError.code === "permission-denied" ||
            firestoreError.message.includes("permissions")
          ) {
            console.log(
              "Permission error when looking up username, will try direct auth"
            );
          } else {
            throw firestoreError;
          }
        }
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail,
        password
      );

      if (!userExists) {
        userExists = await checkUserExists(userCredential.user.uid);
        console.log(`Post-login userExists: ${userExists}`);
      }

      alert("Login successful!");
      navigate("/categories"); // Explicit navigation
    } catch (error) {
      console.error("Login error:", error);
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            setError(
              "User not found. Check your email or username, or sign up."
            );
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email.");
            break;
          case "auth/invalid-credential":
            setError("Invalid credentials. Please check your input.");
            break;
          case "auth/too-many-requests":
            setError("Too many attempts. Please try again later.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your connection.");
            break;
          default:
            setError("Login failed. Please try again.");
        }
      } else {
        switch (error.message) {
          case "auth/user-not-found":
            setError(
              "User not found. Check your email or username, or sign up."
            );
            break;
          case "Multiple users found with this username. Please contact support.":
            setError(error.message);
            break;
          case "Invalid email retrieved from database.":
            setError("Invalid email data. Please contact support.");
            break;
          default:
            setError("Login failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;

      if (!signedInUser || !signedInUser.email) {
        throw new Error("No user or email returned from Google sign-in.");
      }

      const userExists = await checkUserExists(signedInUser.uid);
      console.log(`Google sign-in userExists: ${userExists}`);

      alert("Google sign-in successful!");
      navigate("/categories"); // Explicit navigation
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            setError("Google sign-in was canceled. Please try again.");
            break;
          case "auth/popup-blocked":
            setError("Popup blocked. Please allow popups and try again.");
            break;
          case "auth/account-exists-with-different-credential":
            setError(
              "Account exists with a different sign-in method. Try another method."
            );
            break;
          case "auth/cancelled-popup-request":
            setError("Another authentication request is in progress.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your connection.");
            break;
          default:
            setError("Google sign-in failed. Please try again.");
        }
      } else {
        setError(error.message || "Google sign-in failed. Please try again.");
      }
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

      <div className="relative my-5 flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
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
              <label className="text-white block mb-1">Email or Username</label>
              <input
                type="text"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                autoFocus
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
              {loading ? "Loading..." : "Log In"}
            </button>

            <p className="text-gray-400 text-center text-xs">
              <Link to="/forgot-password" className="underline text-blue-400">
                Forgotten Password?
              </Link>
            </p>

            <h5 className="text-white text-xs text-center">
              Join Ghost and discover thousands of gaming accounts for sale at
              your fingertips.
            </h5>

            <Link to="/">
              <button
                type="button"
                className="w-full mt-5 border-2 border-gray-500 text-white text-xs font-medium p-2 rounded-md hover:bg-gray-700 transition"
              >
                Create An Account
              </button>
            </Link>
          </form>

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
