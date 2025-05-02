import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  const processingAuth = useRef(false);

  const checkUserExists = useCallback(async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      console.log(
        `AuthContext checkUserExists: UID=${uid}, Exists=${userDoc.exists()}`
      );
      if (userDoc.exists()) {
        setUserDetails(userDoc.data());
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error(
        `AuthContext checkUserExists failed for UID=${uid}:`,
        error
      );
      return null;
    }
  }, []);

  const createUserDocument = useCallback(async (user, userData = null) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const defaultUserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.email?.split("@")[0] || "",
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

      try {
        const success = await createUserDocument(currentUser, {
          ...userData,
          setupComplete: true,
        });

        if (success) {
          setUserDetails((prev) => ({
            ...prev,
            ...userData,
            setupComplete: true,
          }));
          navigate("/categories");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error completing user setup:", error);
        return false;
      }
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

  const isPublicRoute = useCallback((path) => {
    const publicRoutes = [
      "/",
      "/login",
      "/sign-up",
      "/privacy-policy",
      "/terms-of-service",
      "/about",
      "/contact",
      "/faq",
    ];
    const isAccountDetailsRoute = path.match(/^\/account\/[^/]+$/);
    return publicRoutes.includes(path) || isAccountDetailsRoute;
  }, []);

  const handleAuthStateChange = useCallback(
    async (user) => {
      // Prevent concurrent processing
      if (processingAuth.current) {
        return;
      }

      processingAuth.current = true;

      try {
        console.log(
          `AuthContext: Auth state changed, User=${
            user ? user.uid : "null"
          }, Path=${location.pathname}`
        );

        if (user) {
          setCurrentUser(user);
          resetInactivityTimer();

          const userData = await checkUserExists(user.uid);

          // Only redirect if needed based on current location and user state
          if (!userData) {
            // New user without a document - create a basic one
            await createUserDocument(user);

            // Don't force redirect to /sign-up on public routes
            if (
              !isPublicRoute(location.pathname) &&
              location.pathname !== "/sign-up"
            ) {
              navigate("/sign-up");
            }
          } else if (!userData.setupComplete) {
            // User exists but setup not complete
            if (location.pathname !== "/sign-up") {
              navigate("/sign-up");
            }
          } else if (userData.setupComplete) {
            // User exists and setup is complete
            if (location.pathname === "/login" || location.pathname === "/") {
              navigate("/categories");
            }
          }
        } else {
          // No user is authenticated
          setCurrentUser(null);
          setUserDetails(null);

          // Only redirect to login if on a protected route
          if (!isPublicRoute(location.pathname)) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      } finally {
        setLoading(false);
        processingAuth.current = false;
      }
    },
    [
      checkUserExists,
      createUserDocument,
      navigate,
      location.pathname,
      isPublicRoute,
      resetInactivityTimer,
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
