import { db } from "../database/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

// Fetch all accounts with their images
export const fetchAccountsWithImages = async () => {
  try {
    // Fetch all accounts
    const accountsQuery = query(collection(db, "accounts"));
    const querySnapshot = await getDocs(accountsQuery);
    const accountIds = querySnapshot.docs.map((doc) => doc.id);
    const accountsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Batch fetch all images for all accounts
    const imagesPromises = accountIds.map((accountId) =>
      getDocs(collection(db, `accounts/${accountId}/images`))
        .then((imagesSnap) => {
          const images = {};
          imagesSnap.forEach((imgDoc) => {
            images[imgDoc.id] = imgDoc.data().image || "";
          });
          return { accountId, images };
        })
        .catch((error) => {
          console.error(
            `Error fetching images for account ${accountId}:`,
            error
          );
          return { accountId, images: {} };
        })
    );

    const allImages = await Promise.all(imagesPromises);
    const imagesMap = allImages.reduce((acc, { accountId, images }) => {
      acc[accountId] = images;
      return acc;
    }, {});

    // Map accounts with their images and fetch user profile pictures
    const accounts = await Promise.all(
      accountsData.map(async (accountData) => {
        let userProfilePic = null;
        // Try fetching using userId first
        if (accountData.userId) {
          console.log(
            `Attempting to fetch user profile for userId: ${accountData.userId}`
          );
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
              console.log(
                `User profile data (using userId) for ${accountData.userId}:`,
                userData
              );
              if (!userProfilePic) {
                console.log(
                  `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for userId: ${accountData.userId}`
                );
              }
            } else {
              console.log(
                `No user document found with ID ${accountData.userId} in users collection`
              );
            }
          } catch (error) {
            console.error(
              `Error fetching user profile for userId ${accountData.userId}:`,
              error
            );
          }
        } else {
          console.log(
            `No userId field found in account ${accountData.id}:`,
            accountData
          );
        }

        // Fallback to username if userId didn't work
        if (!userProfilePic && accountData.username) {
          console.log(
            `Attempting to fetch user profile for username: ${accountData.username}`
          );
          try {
            // Try fetching user document assuming username is the document ID
            const userRef = doc(db, "users", accountData.username);
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
                `User profile data (using username as doc ID) for ${accountData.username}:`,
                userData
              );
              if (!userProfilePic) {
                console.log(
                  `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for ${accountData.username}`
                );
              }
            } else {
              console.log(
                `No user document found with ID ${accountData.username} in users collection`
              );
              // Fallback: Try querying users collection with username field
              const userQuery = query(
                collection(db, "users"),
                where("username", "==", accountData.username)
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
                console.log(
                  `User profile data (using username field) for ${accountData.username}:`,
                  userData
                );
                if (!userProfilePic) {
                  console.log(
                    `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for ${accountData.username}`
                  );
                }
              } else {
                console.log(
                  `No user document found with username field matching ${accountData.username}`
                );
              }
            }
          } catch (error) {
            console.error(
              `Error fetching user profile for username ${accountData.username}:`,
              error
            );
          }
        }

        const images = imagesMap[accountData.id] || {};
        const accountWithImages = {
          ...accountData,
          accountImage: images.accountImage || "",
          screenshots: Object.keys(images)
            .filter((key) => key.startsWith("screenshot"))
            .map((key) => images[key])
            .filter((img) => img),
          userProfilePic: userProfilePic,
        };
        console.log(
          `Processed account ${accountData.id} with images and profile pic:`,
          accountWithImages
        );
        return accountWithImages;
      })
    );

    console.log("Final accounts data returned to Category.jsx:", accounts);
    return accounts;
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return [];
  }
};

// Fetch a single account by ID with its images and user profile picture
export const fetchAccountByIdWithImages = async (accountId) => {
  try {
    const accountsQuery = query(collection(db, "accounts"));
    const querySnapshot = await getDocs(accountsQuery);
    const accountDoc = querySnapshot.docs.find((doc) => doc.id === accountId);

    if (!accountDoc) {
      console.log(`No account found with ID: ${accountId}`);
      return null;
    }

    const accountData = { id: accountDoc.id, ...accountDoc.data() };
    let userProfilePic = null;

    // Try fetching using userId first
    if (accountData.userId) {
      console.log(
        `Attempting to fetch user profile for userId: ${accountData.userId}`
      );
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
          console.log(
            `User profile data (using userId) for ${accountData.userId}:`,
            userData
          );
          if (!userProfilePic) {
            console.log(
              `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for userId: ${accountData.userId}`
            );
          }
        } else {
          console.log(
            `No user document found with ID ${accountData.userId} in users collection`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching user profile for userId ${accountData.userId}:`,
          error
        );
      }
    } else {
      console.log(
        `No userId field found in account ${accountId}:`,
        accountData
      );
    }

    // Fallback to username if userId didn't work
    if (!userProfilePic && accountData.username) {
      console.log(
        `Attempting to fetch user profile for username: ${accountData.username}`
      );
      try {
        // Try fetching user document assuming username is the document ID
        const userRef = doc(db, "users", accountData.username);
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
            `User profile data (using username as doc ID) for ${accountData.username}:`,
            userData
          );
          if (!userProfilePic) {
            console.log(
              `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for ${accountData.username}`
            );
          }
        } else {
          console.log(
            `No user document found with ID ${accountData.username} in users collection`
          );
          // Fallback: Try querying users collection with username field
          const userQuery = query(
            collection(db, "users"),
            where("username", "==", accountData.username)
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
            console.log(
              `User profile data (using username field) for ${accountData.username}:`,
              userData
            );
            if (!userProfilePic) {
              console.log(
                `No profile picture field (profilePic, profileImage, photoURL, profilePicture, avatar) found in user document for ${accountData.username}`
              );
            }
          } else {
            console.log(
              `No user document found with username field matching ${accountData.username}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error fetching user profile for username ${accountData.username}:`,
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
        ...accountData,
        accountImage: images.accountImage || "",
        screenshots: Object.keys(images)
          .filter((key) => key.startsWith("screenshot"))
          .map((key) => images[key])
          .filter((img) => img),
        userProfilePic: userProfilePic,
      };
      console.log(
        "Final account data with images and profile pic:",
        accountWithImages
      );
      return accountWithImages;
    } catch (error) {
      console.error(`Error fetching images for account ${accountId}:`, error);
      const accountWithImages = {
        ...accountData,
        accountImage: "",
        screenshots: [],
        userProfilePic: userProfilePic,
      };
      console.log(
        "Final account data (with error in images):",
        accountWithImages
      );
      return accountWithImages;
    }
  } catch (err) {
    console.error("Error fetching account:", err);
    return null;
  }
};
