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

  const checkUserExists = useCallback(async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      console.log(
        `AuthContext checkUserExists: UID=${uid}, Exists=${userDoc.exists()}`
      );
      if (userDoc.exists()) {
        setUserDetails(userDoc.data());
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `AuthContext checkUserExists failed for UID=${uid}:`,
        error
      );
      return false; // Changed to false - don't assume user exists on error
    }
  }, []);

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

      const finalUserData = userData || defaultUserData;
      await setDoc(userRef, finalUserData, { merge: true });
      console.log(
        `AuthContext: User document created/updated for UID: ${user.uid}`
      );
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

  const completeUserSetup = useCallback(
    async (userData) => {
      if (!currentUser) {
        console.error("No authenticated user to complete setup for");
        return false;
      }

      const success = await createUserDocument(currentUser, {
        ...userData,
        setupComplete: true,
      });

      if (success) {
        navigate("/categories");
        return true;
      }
      return false;
    },
    [currentUser, createUserDocument, navigate]
  );

  const logout = useCallback(async () => {
    try {
      console.log("AuthContext: Logging out user");
      if (userTimeout) {
        clearTimeout(userTimeout);
        setUserTimeout(null);
      }
      setCurrentUser(null);
      setUserDetails(null);
      setLastProcessedUid(null); // Clear to allow reprocessing
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate, userTimeout]);

  const resetInactivityTimer = useCallback(() => {
    if (userTimeout) {
      clearTimeout(userTimeout);
    }

    if (currentUser) {
      const timer = setTimeout(() => {
        console.log("Session timeout - logging out");
        logout();
      }, 60 * 60 * 1000);
      setUserTimeout(timer);
    }
  }, [currentUser, logout, userTimeout]);

  const [lastProcessedUid, setLastProcessedUid] = useState(null);

  const handleAuthStateChange = useCallback(
    async (user) => {
      if (user?.uid === lastProcessedUid && !loading) {
        return;
      }

      console.log(
        `AuthContext: Auth state changed, User=${
          user ? user.uid : "null"
        }, Path=${location.pathname}`
      );

      if (user) {
        setLastProcessedUid(user.uid);
        setCurrentUser(user);

        // Check if the user exists in Firestore
        const userExists = await checkUserExists(user.uid);
        console.log(
          `Navigation check: userExists=${userExists}, setupComplete=${userDetails?.setupComplete}, path=${location.pathname}`
        );

        if (!userExists) {
          // Don't navigate - just let the user stay on the current page
          // They will see an error message on login/signup pages
          console.log("User authenticated but no Firestore record exists");

          // Only force navigation if they're trying to access protected routes
          const publicRoutes = ["/", "/login", "/sign-up"];
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login");
          }
        } else if (
          userExists &&
          userDetails?.setupComplete &&
          (location.pathname === "/login" || location.pathname === "/")
        ) {
          navigate("/categories");
        } else if (userExists && !userDetails?.setupComplete) {
          navigate("/sign-up");
        }
      } else {
        // User is not authenticated
        setCurrentUser(null);
        setUserDetails(null);
        setLastProcessedUid(null);

        // Only redirect from protected routes
        const publicRoutes = ["/", "/login", "/sign-up"];
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      }

      setLoading(false);
    },
    [
      checkUserExists,
      navigate,
      location.pathname,
      loading,
      lastProcessedUid,
      userDetails,
    ]
  );

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return unsubscribe;
  }, [handleAuthStateChange]);

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
