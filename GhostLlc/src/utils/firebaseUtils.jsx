import { db } from "../database/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  runTransaction,
  setDoc,
} from "firebase/firestore";

// Generate or retrieve a unique anonymous ID for unauthenticated users
const getAnonymousId = () => {
  let anonymousId = localStorage.getItem("anonymousId");
  if (!anonymousId) {
    anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("anonymousId", anonymousId);
  }
  return anonymousId;
};

// Initialize views field for all accounts
export const initializeViews = async () => {
  try {
    console.log("Initializing views for all accounts...");
    const accountsRef = collection(db, "accounts");
    const snapshot = await getDocs(accountsRef);
    let updatedCount = 0;

    for (const accountDoc of snapshot.docs) {
      const data = accountDoc.data();
      if (data.views === undefined || data.views === null) {
        await updateDoc(doc(db, "accounts", accountDoc.id), { views: 0 });
        console.log(`Initialized views to 0 for account ${accountDoc.id}`);
        updatedCount++;
      } else {
        console.log(
          `Views already set for account ${accountDoc.id}: ${data.views}`
        );
      }
    }

    console.log(`Initialization complete. Updated ${updatedCount} accounts.`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error initializing views:", error);
    return { success: false, error };
  }
};

// Fetch a single account by ID with its images and user profile picture
export const fetchAccountByIdWithImages = async (
  accountId,
  user = null // Pass currentUser or null
) => {
  try {
    console.log(`Fetching account with ID: ${accountId}`);
    const accountRef = doc(db, "accounts", accountId);
    const accountDoc = await getDoc(accountRef);

    if (!accountDoc.exists()) {
      console.log(`No account found with ID: ${accountId}`);
      return null;
    }

    const accountData = { id: accountDoc.id, ...accountDoc.data() };
    console.log(`Initial account data:`, accountData);

    // Increment views for unique users
    const viewerId = user ? user.uid : getAnonymousId();
    const viewType = user ? "authenticated" : "anonymous";
    console.log(`Viewer ID: ${viewerId} (${viewType})`);

    try {
      await runTransaction(db, async (transaction) => {
        const viewRef = doc(db, `accounts/${accountId}/views`, viewerId);
        const viewDoc = await transaction.get(viewRef);

        if (!viewDoc.exists()) {
          // New viewer, record the view and increment views
          transaction.set(viewRef, {
            [viewType === "authenticated" ? "userId" : "anonymousId"]: viewerId,
            viewedAt: new Date().toISOString(),
          });
          transaction.update(accountRef, {
            views: accountData.views != null ? increment(1) : 1, // Initialize to 1 if null
          });
          console.log(
            `Recording new view for ${viewerId} on account ${accountId}`
          );
        } else {
          console.log(`Viewer ${viewerId} already viewed account ${accountId}`);
        }
      });
      console.log(`View transaction completed for account ${accountId}`);
    } catch (viewError) {
      console.error(
        `Failed to record view for account ${accountId}:`,
        viewError
      );
    }

    // Fetch the updated document to get the latest view count
    const updatedAccountDoc = await getDoc(accountRef);
    const updatedAccountData = {
      id: updatedAccountDoc.id,
      ...updatedAccountDoc.data(),
    };
    console.log(`Updated account data with views:`, updatedAccountData.views);

    let userProfilePic = null;

    if (updatedAccountData.userId) {
      console.log(
        `Fetching user profile for userId: ${updatedAccountData.userId}`
      );
      try {
        const userRef = doc(db, "users", updatedAccountData.userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userProfilePic =
            userData.profilePic ||
            userData.profileImage ||
            userData.photoURL ||
            userData.profilePicture ||
            userData.avatar ||
            null;
          console.log(
            `User profile data for ${updatedAccountData.userId}:`,
            userData
          );
          if (!userProfilePic) {
            console.log(
              `No profile picture found for userId: ${updatedAccountData.userId}`
            );
          }
        } else {
          console.log(
            `No user document found for userId: ${updatedAccountData.userId}`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching user profile for userId ${updatedAccountData.userId}:`,
          error
        );
      }
    } else {
      console.log(`No userId field in account ${accountId}`);
    }

    if (!userProfilePic && updatedAccountData.username) {
      console.log(
        `Fetching user profile for username: ${updatedAccountData.username}`
      );
      try {
        const userRef = doc(db, "users", updatedAccountData.username);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userProfilePic =
            userData.profilePic ||
            userData.profileImage ||
            userData.photoURL ||
            userData.profilePicture ||
            userData.avatar ||
            null;
          console.log(
            `User profile data for username ${updatedAccountData.username}:`,
            userData
          );
          if (!userProfilePic) {
            console.log(
              `No profile picture found for username: ${updatedAccountData.username}`
            );
          }
        } else {
          console.log(
            `No user document found for username: ${updatedAccountData.username}`
          );
          const userQuery = query(
            collection(db, "users"),
            where("username", "==", updatedAccountData.username)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            userProfilePic =
              userData.profilePic ||
              userData.profileImage ||
              userData.photoURL ||
              userData.profilePicture ||
              userData.avatar ||
              null;
            console.log(`User profile data via username query:`, userData);
            if (!userProfilePic) {
              console.log(`No profile picture found in username query`);
            }
          } else {
            console.log(
              `No user found with username field: ${updatedAccountData.username}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error fetching user profile for username ${updatedAccountData.username}:`,
          error
        );
      }
    }

    try {
      const imagesRef = collection(db, `accounts/${accountId}/images`);
      const imagesSnap = await getDocs(imagesRef);
      const images = {};
      imagesSnap.forEach((imgDoc) => {
        images[imgDoc.id] = imgDoc.data().image || "";
      });
      const accountWithImages = {
        ...updatedAccountData,
        accountImage: images.accountImage || "",
        screenshots: Object.keys(images)
          .filter((key) => key.startsWith("screenshot"))
          .map((key) => images[key])
          .filter((img) => img),
        userProfilePic: userProfilePic,
      };
      console.log(`Final account data with images:`, accountWithImages);
      return accountWithImages;
    } catch (error) {
      console.error(`Error fetching images for account ${accountId}:`, error);
      const accountWithImages = {
        ...updatedAccountData,
        accountImage: "",
        screenshots: [],
        userProfilePic: userProfilePic,
      };
      console.log(`Final account data (no images):`, accountWithImages);
      return accountWithImages;
    }
  } catch (err) {
    console.error(`Error fetching account ${accountId}:`, err);
    return null;
  }
};

// Fetch all accounts with images (used by Category.jsx)
export const fetchAccountsWithImages = async (userId = null) => {
  try {
    console.log(`Fetching accounts${userId ? ` for user ${userId}` : ""}`);
    const accountsRef = collection(db, "accounts");
    let accountsQuery = accountsRef;

    // If userId is provided, filter by userId
    if (userId) {
      accountsQuery = query(accountsRef, where("userId", "==", userId));
    }

    const accountsSnapshot = await getDocs(accountsQuery);
    const accounts = [];

    for (const accountDoc of accountsSnapshot.docs) {
      const accountData = { id: accountDoc.id, ...accountDoc.data() };

      // Fetch images for the account
      let accountImage = "";
      let screenshots = [];
      try {
        const imagesRef = collection(db, `accounts/${accountDoc.id}/images`);
        const imagesSnap = await getDocs(imagesRef);
        const images = {};
        imagesSnap.forEach((imgDoc) => {
          images[imgDoc.id] = imgDoc.data().image || "";
        });
        accountImage = images.accountImage || "";
        screenshots = Object.keys(images)
          .filter((key) => key.startsWith("screenshot"))
          .map((key) => images[key])
          .filter((img) => img);
      } catch (error) {
        console.error(
          `Error fetching images for account ${accountDoc.id}:`,
          error
        );
      }

      // Fetch user profile picture
      let userProfilePic = null;
      if (accountData.userId) {
        try {
          const userRef = doc(db, "users", accountData.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userProfilePic =
              userData.profilePic ||
              userData.profileImage ||
              userData.photoURL ||
              userData.profilePicture ||
              userData.avatar ||
              null;
          }
        } catch (error) {
          console.error(
            `Error fetching user profile for userId ${accountData.userId}:`,
            error
          );
        }
      } else if (accountData.username) {
        try {
          const userQuery = query(
            collection(db, "users"),
            where("username", "==", accountData.username)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            userProfilePic =
              userData.profilePic ||
              userData.profileImage ||
              userData.photoURL ||
              userData.profilePicture ||
              userData.avatar ||
              null;
          }
        } catch (error) {
          console.error(
            `Error fetching user profile for username ${accountData.username}:`,
            error
          );
        }
      }

      accounts.push({
        ...accountData,
        accountImage,
        screenshots,
        userProfilePic,
      });
    }

    console.log(`Fetched ${accounts.length} accounts`);
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
};
