import AchievementCard from "../components/AchievementCard"

const achievements = [
    {
        id: 1,
        title: "Profile Complete",
        description: "Complete your profile to unlock this reward.",
        icon: "/icons/profile.svg",
        progress: 100,
        unlocked: false,
        coins: 100,
    },
    {
        id: 2,
        title: "First Upload",
        description: "Upload your first account to earn coins.",
        icon: "/icons/upload.svg",
        progress: 75,
        unlocked: false,
        coins: 150,
    },
    {
        id: 3,
        title: "First Purchase",
        description: "Buy an account from the Ghost Store.",
        icon: "/icons/shopping-cart.svg",
        progress: 0,
        unlocked: false,
        coins: 200,
    },
    {
        id: 4,
        title: "Veteran Seller",
        description: "Upload 10 accounts.",
        icon: "/icons/star.svg",
        progress: 100,
        unlocked: true,
        coins: 500,
    },
    {
        id: 5,
        title: "Ghost Explorer",
        description: "Visit all tabs on the platform.",
        icon: "/icons/explore.svg",
        progress: 30,
        unlocked: false,
        coins: 250,
    },
]

const AchievementsGrid = () => {
    return (
        <div className="w-full min-h-screen bg-[#121212] px-4 py-8">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
                🏆 Your Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
                {achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} {...achievement} />
                ))}
            </div>
        </div>
    )
}

export default AchievementsGrid