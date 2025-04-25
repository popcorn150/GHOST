import NavBar from "../components/NavBar"
import { Toaster, toast } from "sonner";
import { useState } from "react";
import Confetti from "react-confetti";
import {
    AlfredIcon,
    EntrepreneurIcon,
    FlexIcon,
    HawkIcon,
    MuscleIcon,
    PeacockIcon,
    RichhIcon,
    SplendidIcon
} from "../utils";

const initialAchievements = [
    {
        id: 1,
        title: "Flex",
        description: "Purchased up to 5 accounts in a day",
        img: FlexIcon,
        earned: false,
        progress: 100,
    },
    {
        id: 2,
        title: "Peacock",
        description: "Have up to 50 views for just an upload",
        img: PeacockIcon,
        earned: false,
        progress: 100,
    },
    {
        id: 3,
        title: "Entrepreneur",
        description: "Upload up to 10 accounts for sale",
        img: EntrepreneurIcon,
        earned: false,
        progress: 60,
    },
    {
        id: 4,
        title: "Big Spender",
        description: "Purchase a high selling account",
        img: RichhIcon,
        earned: false,
        progress: 10,
    },
    {
        id: 5,
        title: "Alfred (Suit up & Ready to Go)",
        description: "Complete setting up your profile account",
        img: AlfredIcon,
        earned: true,
        progress: 100,
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
        progress: 100,
    },
    {
        id: 8,
        title: "Splendid Taste",
        description: "Purchased an account that has lots of views",
        img: SplendidIcon,
        earned: true,
        progress: 100,
    }
];

const AchievementsGrid = () => {
    const [achievements, setAchievements] = useState(initialAchievements);
    const [confetti, setConfetti] = useState(false);

    const handleClaim = () => {
        setAchievements((prev) =>
            prev.map((ach) =>
                ach.id === id ? { ...ach, earned: true } : ach
            )
        );
        setConfetti(true);
        toast.success(`Achievement Unlocked: ${achievements.title}`);

        setTimeout(() => setConfetti(false), 3000);
    };

    return (
        <>
            <NavBar />
            <div className="p-6 text-white min-h-screen">
                <Toaster richColors position="top-center" />
                <h1 className="text-start font-medium text-lg text-white mb-4">
                    Earned {achievements.filter(a => a.earned).length} out of {achievements.length}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`rounded-2xl p-4 border shadow-xl transition-all duration-300 ${achievement.earned
                                ? "bg-gradient-to-br from-green-500/20 to-blue-500/10 border-green-500"
                                : "bg-zinc-900 border-zinc-700 opacity-50"
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <img src={achievement.img} alt={achievement.title} className="h-16 mb-4" />
                                <h2 className="text-lg font-semibold mb-1">{achievement.title}</h2>
                                <p className="text-sm text-zinc-400">{achievement.description}</p>
                            </div>

                            {!achievement.earned && (
                                <div className="mt-4 w-full">
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${achievement.progress}%` }}
                                        ></div>
                                    </div>
                                    {achievement.progress < 100 && (
                                        <button
                                            className="mt-2 w-full bg-green-600 text-white text-sm py-1 rounded-md"
                                            onClick={() => handleClaim(achievement.id)}
                                        >
                                            Claim
                                        </button>
                                    )}
                                </div>
                            )}

                            {achievement.earned && (
                                <div className="mt-4 text-green-500 text-sm font-medium">Unlocked ✓</div>
                            )}
                        </div>
                    ))}
                </div>
                {confetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            </div>
        </>
    )
}

export default AchievementsGrid