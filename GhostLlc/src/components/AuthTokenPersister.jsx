import { useEffect } from "react";
import { useAuth } from "./AuthContext";

function AuthTokenPersister() {
  const { currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function storeToken() {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(/* forceRefresh */ false);
          if (isMounted) {
            localStorage.setItem("firebaseToken", token);
          }
        } catch (err) {
          console.error("Failed to get Firebase ID token:", err);
        }
      } else {
        // user logged out, clean up
        localStorage.removeItem("firebaseToken");
      }
    }

    storeToken();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return null; // this component doesn’t render anything
}

export default AuthTokenPersister;
