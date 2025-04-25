import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../database/firebaseConfig";
import NavBar from "../components/NavBar";
import { Toaster, toast } from "sonner";
import Confetti from "react-confetti";
import {
  AlfredIcon,
  EntrepreneurIcon,
  FlexIcon,
  HawkIcon,
  MuscleIcon,
  PeacockIcon,
  RichhIcon,
  SplendidIcon,
} from "../utils";

const initialAchievements = [
  {
    id: 1,
    title: "Flex",
    description: "Purchased up to 5 accounts in a day",
    img: FlexIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 2,
    title: "Peacock",
    description: "Have up to 50 views for just an upload",
    img: PeacockIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 3,
    title: "Entrepreneur",
    description: "Upload up to 10 accounts for sale",
    img: EntrepreneurIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 4,
    title: "Big Spender",
    description: "Purchase a high selling account",
    img: RichhIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 5,
    title: "Alfred (Suit up & Ready to Go)",
    description: "Complete setting up your profile account",
    img: AlfredIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 6,
    title: "Hawk Eye",
    description: "Purchased an account within an hour of upload",
    img: HawkIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 7,
    title: "Hustler",
    description: "Sold lots of accounts",
    img: MuscleIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 8,
    title: "Splendid Taste",
    description: "Purchased an account that has lots of views",
    img: SplendidIcon,
    earned: false,
    progress: 0,
  },
];

const AchievementsGrid = () => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [confetti, setConfetti] = useState(false);

  // Fetch user's achievement statuses from Firestore
  useEffect(() => {
    const fetchAchievements = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userAchievements = userData.achievementStatuses || {};
            const mergedAchievements = initialAchievements.map((initAch) => {
              const userAch = userAchievements[initAch.id] || {
                earned: false,
                progress: 0,
              };
              return { ...initAch, ...userAch };
            });
            setAchievements(mergedAchievements);
          } else {
            // Initialize achievement statuses
            await updateDoc(userDocRef, {
              achievementStatuses: initialAchievements.reduce((acc, ach) => {
                acc[ach.id] = { earned: false, progress: 0 };
                return acc;
              }, {}),
            });
            setAchievements(initialAchievements);
          }
        } catch (error) {
          console.error("Error fetching achievements:", error);
          toast.error("Failed to load achievements.");
        }
      }
    };
    fetchAchievements();
  }, []);

  // Handle claiming an achievement
  const handleClaim = async (id) => {
    const achievement = achievements.find((ach) => ach.id === id);
    if (achievement.progress < 100) {
      toast.error("You haven't met the requirements yet.");
      return;
    }

    try {
      // Update state
      setAchievements((prev) =>
        prev.map((ach) => (ach.id === id ? { ...ach, earned: true } : ach))
      );
      setConfetti(true);
      toast.success(`Achievement Unlocked: ${achievement.title}`);

      // Update Firestore
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          [`achievementStatuses.${id}`]: { earned: true, progress: 100 },
        });
      }

      setTimeout(() => setConfetti(false), 3000);
    } catch (error) {
      console.error("Error claiming achievement:", error);
      toast.error("Failed to claim achievement.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="p-6 text-white min-h-screen">
        <Toaster richColors position="top-center" />
        <h1 className="text-start font-medium text-lg text-white mb-4">
          Earned {achievements.filter((a) => a.earned).length} out of{" "}
          {achievements.length}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-2xl p-4 border shadow-xl transition-all duration-300 ${
                achievement.earned
                  ? "bg-gradient-to-br from-green-500/20 to-blue-500/10 border-green-500"
                  : "bg-zinc-900 border-zinc-700 opacity-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={achievement.img}
                  alt={achievement.title}
                  className="h-16 mb-4"
                />
                <h2 className="text-lg font-semibold mb-1">
                  {achievement.title}
                </h2>
                <p className="text-sm text-zinc-400">
                  {achievement.description}
                </p>
              </div>

              {!achievement.earned && (
                <div className="mt-4 w-full">
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                  {achievement.progress >= 100 && (
                    <button
                      className="mt-2 w-full bg-green-600 text-white text-sm py-1 rounded-md hover:bg-green-700 transition"
                      onClick={() => handleClaim(achievement.id)}
                    >
                      Claim
                    </button>
                  )}
                </div>
              )}

              {achievement.earned && (
                <div className="mt-4 text-green-500 text-sm font-medium">
                  Unlocked ✓
                </div>
              )}
            </div>
          ))}
        </div>
        {confetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
      </div>
    </>
  );
};

export default AchievementsGrid;
