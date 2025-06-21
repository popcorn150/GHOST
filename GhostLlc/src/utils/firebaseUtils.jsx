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
} from "firebase/firestore";

// Cache for user profiles to avoid duplicate requests
const userProfileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

    // Process in batches for better performance
    const batchPromises = [];
    snapshot.docs.forEach(accountDoc => {
      const data = accountDoc.data();
      if (data.views === undefined || data.views === null) {
        batchPromises.push(
          updateDoc(doc(db, "accounts", accountDoc.id), { views: 0 })
        );
        updatedCount++;
      }
    });

    await Promise.all(batchPromises);
    console.log(`Initialization complete. Updated ${updatedCount} accounts.`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error initializing views:", error);
    return { success: false, error };
  }
};

// Optimized function to fetch user profile with caching - EXPORTED FOR USE IN COMPONENTS
export const fetchUserProfileOptimized = async (userId, username) => {
  const cacheKey = userId || username;
  const cached = userProfileCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.profilePic;
  }

  try {
    let userData = null;
    
    if (userId) {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    }
    
    // Only try username lookup if userId lookup failed
    if (!userData && username) {
      const userQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        userData = userSnapshot.docs[0].data();
      }
    }

    const profilePic = userData ? (
      userData.profilePic ||
      userData.profileImage ||
      userData.photoURL ||
      userData.profilePicture ||
      userData.avatar ||
      null
    ) : null;

    // Cache the result
    userProfileCache.set(cacheKey, {
      profilePic,
      timestamp: Date.now()
    });

    return profilePic;
  } catch (error) {
    console.error(`Error fetching user profile for ${cacheKey}:`, error);
    return null;
  }
};

// Optimized function to fetch account images
const fetchAccountImages = async (accountId) => {
  try {
    const imagesRef = collection(db, `accounts/${accountId}/images`);
    const imagesSnap = await getDocs(imagesRef);
    const images = {};
    
    imagesSnap.forEach((imgDoc) => {
      images[imgDoc.id] = imgDoc.data().image || "";
    });

    return {
      accountImage: images.accountImage || "",
      screenshots: Object.keys(images)
        .filter((key) => key.startsWith("screenshot"))
        .map((key) => images[key])
        .filter((img) => img)
    };
  } catch (error) {
    console.error(`Error fetching images for account ${accountId}:`, error);
    return { accountImage: "", screenshots: [] };
  }
};

// Fetch a single account by ID with its images and user profile picture
export const fetchAccountByIdWithImages = async (
  accountId,
  user = null,
  shouldIncrementViews = true // New parameter to control view increments
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

    // Only increment views if explicitly requested (e.g., when viewing account details)
    if (shouldIncrementViews) {
      const viewerId = user ? user.uid : getAnonymousId();
      const viewType = user ? "authenticated" : "anonymous";

      try {
        await runTransaction(db, async (transaction) => {
          const viewRef = doc(db, `accounts/${accountId}/views`, viewerId);
          const viewDoc = await transaction.get(viewRef);

          if (!viewDoc.exists()) {
            transaction.set(viewRef, {
              [viewType === "authenticated" ? "userId" : "anonymousId"]: viewerId,
              viewedAt: new Date().toISOString(),
            });
            transaction.update(accountRef, {
              views: accountData.views != null ? increment(1) : 1,
            });
          }
        });
      } catch (viewError) {
        console.error(`Failed to record view for account ${accountId}:`, viewError);
      }

      // Fetch updated document to get latest view count
      const updatedAccountDoc = await getDoc(accountRef);
      const updatedData = { id: updatedAccountDoc.id, ...updatedAccountDoc.data() };
      
      // Fetch images and user profile in parallel
      const [imageData, userProfilePic] = await Promise.all([
        fetchAccountImages(accountId),
        fetchUserProfileOptimized(updatedData.userId, updatedData.username)
      ]);

      return {
        ...updatedData,
        ...imageData,
        userProfilePic
      };
    } else {
      // For listing views, fetch images and user profile in parallel without incrementing views
      const [imageData, userProfilePic] = await Promise.all([
        fetchAccountImages(accountId),
        fetchUserProfileOptimized(accountData.userId, accountData.username)
      ]);

      return {
        ...accountData,
        ...imageData,
        userProfilePic
      };
    }
  } catch (err) {
    console.error(`Error fetching account ${accountId}:`, err);
    return null;
  }
};

// Heavily optimized function to fetch all accounts with images
export const fetchAccountsWithImages = async (userId = null) => {
  try {
    console.log(`Fetching accounts${userId ? ` for user ${userId}` : ""}`);
    const accountsRef = collection(db, "accounts");
    let accountsQuery = accountsRef;

    if (userId) {
      accountsQuery = query(accountsRef, where("userId", "==", userId));
    }

    const accountsSnapshot = await getDocs(accountsQuery);
    
    if (accountsSnapshot.empty) {
      console.log("No accounts found");
      return [];
    }

    // Process all accounts in parallel
    const accountPromises = accountsSnapshot.docs.map(async (accountDoc) => {
      const accountData = { id: accountDoc.id, ...accountDoc.data() };

      // Fetch images and user profile in parallel
      const [imageData, userProfilePic] = await Promise.all([
        fetchAccountImages(accountDoc.id),
        fetchUserProfileOptimized(accountData.userId, accountData.username)
      ]);

      return {
        ...accountData,
        ...imageData,
        userProfilePic
      };
    });

    // Wait for all accounts to be processed
    const accounts = await Promise.all(accountPromises);
    
    console.log(`Fetched ${accounts.length} accounts`);
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
};

// New function specifically for fast initial loading (minimal data)
export const fetchAccountsMinimal = async (userId = null) => {
  try {
    console.log(`Fetching minimal account data${userId ? ` for user ${userId}` : ""}`);
    const accountsRef = collection(db, "accounts");
    let accountsQuery = accountsRef;

    if (userId) {
      accountsQuery = query(accountsRef, where("userId", "==", userId));
    }

    const accountsSnapshot = await getDocs(accountsQuery);
    
    if (accountsSnapshot.empty) {
      return [];
    }

    // Return only essential data for initial render
    const accounts = accountsSnapshot.docs.map(accountDoc => {
      const data = accountDoc.data();
      return {
        id: accountDoc.id,
        accountName: data.accountName || "Untitled",
        username: data.username || "Ghost",
        userId: data.userId, // Include userId for profile picture fetching
        views: data.views || 0,
        currency: data.currency || "USD",
        accountWorth: data.accountWorth || "N/A",
        category: data.category || "Others",
        sold: data.sold || false,
        accountDescription: data.accountDescription || "No description",
        accountCredential: data.accountCredential || "N/A",
        // Placeholder image initially
        accountImage: "",
        screenshots: [],
        userProfilePic: null
      };
    });

    console.log(`Fetched ${accounts.length} minimal accounts`);
    return accounts;
  } catch (error) {
    console.error("Error fetching minimal accounts:", error);
    return [];
  }
};

// Function to lazy load images for accounts
export const loadAccountImages = async (accountIds) => {
  try {
    const imagePromises = accountIds.map(async (accountId) => {
      const imageData = await fetchAccountImages(accountId);
      return { accountId, ...imageData };
    });

    const results = await Promise.all(imagePromises);
    return results.reduce((acc, result) => {
      acc[result.accountId] = {
        accountImage: result.accountImage,
        screenshots: result.screenshots
      };
      return acc;
    }, {});
  } catch (error) {
    console.error("Error loading account images:", error);
    return {};
  }
};