import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth, db } from "../database/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTimeout, setUserTimeout] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the user exists in Firestore - memoized
  const checkUserExists = useCallback(async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      console.log(
        `AuthContext checkUserExists: UID=${uid}, Exists=${userDoc.exists()}`
      );

      if (userDoc.exists()) {
        // Store user details if they exist
        setUserDetails(userDoc.data());
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `AuthContext checkUserExists failed for UID=${uid}:`,
        error
      );
      return false;
    }
  }, []);

  // Create user document in Firestore - memoized
  const createUserDocument = useCallback(async (user, userData = null) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const defaultUserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        setupComplete: false,
      };

      // Use provided userData if available, otherwise use defaults
      const finalUserData = userData || defaultUserData;

      await setDoc(userRef, finalUserData, { merge: true });
      console.log(
        `AuthContext: User document created/updated for UID: ${user.uid}`
      );

      // Update local user details
      setUserDetails(finalUserData);
      return true;
    } catch (error) {
      console.error(
        `AuthContext createUserDocument failed for UID=${user.uid}:`,
        error
      );
      return false;
    }
  }, []);

  // Complete user setup - for use during sign-up
  const completeUserSetup = useCallback(
    async (userData) => {
      if (!currentUser) {
        console.error("No authenticated user to complete setup for");
        return false;
      }

      // Update the user document with setup data
      const success = await createUserDocument(currentUser, {
        ...userData,
        setupComplete: true,
      });

      if (success) {
        // Redirect to home/dashboard after successful setup
        navigate("/categories");
        return true;
      }
      return false;
    },
    [currentUser, createUserDocument, navigate]
  );

  // Logout function - memoized
  const logout = useCallback(async () => {
    try {
      console.log("AuthContext: Logging out user");

      // Clear timeout first
      if (userTimeout) {
        clearTimeout(userTimeout);
        setUserTimeout(null);
      }

      // Then clear user state
      setCurrentUser(null);
      setUserDetails(null);

      // Finally sign out - this will trigger the auth state change
      await signOut(auth);

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate, userTimeout]);

  // Session timeout handling - Auto logout after 1 hour of inactivity
  const resetInactivityTimer = useCallback(() => {
    if (userTimeout) {
      clearTimeout(userTimeout);
    }

    // Only set the timer if a user is logged in
    if (currentUser) {
      const timer = setTimeout(() => {
        console.log("Session timeout - logging out");
        logout();
      }, 60 * 60 * 1000); // 1 hour

      setUserTimeout(timer);
    }
  }, [currentUser, logout, userTimeout]);

  // Handle auth state changes - memoized with a tracker to prevent looping
  const [lastProcessedUid, setLastProcessedUid] = useState(null);

  const handleAuthStateChange = useCallback(
    async (user) => {
      // Prevent multiple processing of the same auth state
      if (user?.uid === lastProcessedUid && !loading) {
        return;
      }

      console.log(
        `AuthContext: Auth state changed, User=${
          user ? user.uid : "null"
        }, Path=${location.pathname}`
      );

      if (user) {
        // Update last processed UID to prevent loops
        setLastProcessedUid(user.uid);

        try {
          // Update current user state
          setCurrentUser(user);

          // Check if user exists in Firestore
          const userExists = await checkUserExists(user.uid);

          // For new users who aren't on the sign-up page yet, direct them there
          if (!userExists && location.pathname !== "/sign-up") {
            navigate("/sign-up");
          } else if (
            userExists &&
            (location.pathname === "/login" || location.pathname === "/")
          ) {
            // If user exists and is on login or landing page, redirect to categories
            navigate("/categories");
          }

          // Initialize activity monitoring
          resetInactivityTimer();
        } catch (error) {
          console.error("Auth state change error:", error);
        }
      } else {
        // User logged out, clear states
        setCurrentUser(null);
        setUserDetails(null);
        setLastProcessedUid(null);

        // Redirect to login only if not already on login or landing page
        if (location.pathname !== "/login" && location.pathname !== "/") {
          navigate("/login");
        }
      }

      setLoading(false);
    },
    [
      checkUserExists,
      navigate,
      resetInactivityTimer,
      location.pathname,
      loading,
      lastProcessedUid,
    ]
  );

  // Setup event listeners for user activity
  useEffect(() => {
    const setupActivityListeners = () => {
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];
      const resetTimer = () => {
        resetInactivityTimer();
      };
      events.forEach((event) => {
        document.addEventListener(event, resetTimer);
      });
      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, resetTimer);
        });
      };
    };
    const cleanup = setupActivityListeners();
    return cleanup;
  }, [resetInactivityTimer]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return unsubscribe;
  }, [handleAuthStateChange]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (userTimeout) {
        clearTimeout(userTimeout);
      }
    };
  }, [userTimeout]);

  const value = {
    currentUser,
    userDetails,
    isAuthenticated: !!currentUser,
    isSetupComplete: userDetails?.setupComplete || false,
    logout,
    resetInactivityTimer,
    createUserDocument,
    completeUserSetup,
    checkUserExists,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
