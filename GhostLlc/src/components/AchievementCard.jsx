import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Toaster, toast } from "sonner";

const AchievementCard = ({
    title,
    description,
    icon,
    unlocked,
    progress,
    coins,
}) => {
    const [isClaimable, setIsClaimable] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (progress >= 100 && !unlocked) {
            setIsClaimable(true);
        }
    }, [progress, unlocked]);

    const handleClaim = () => {
        setIsClaimed(true);
        setShowConfetti(true);
        toast.success(`You unlocked ${title} and earned ${coins} coins!`);
        setTimeout(() => {
            setShowConfetti(false);
        }, 3000);
    };

    const cardFront = (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white">
            <img src={icon} alt="icon" className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    );

    const cardBack = (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-700 rounded-full mb-4" />
            <div className="w-24 h-4 bg-gray-700 rounded mb-1" />
            <div className="w-32 h-3 bg-gray-700 rounded" />
        </div>
    );


    return (
        <>
            <div className="relative w-48 h-64">
                <Toaster richColors position="top-center" />
                <AnimatePresence>
                    {showConfetti && <Confetti numberOfPieces={150} recycle={false} />}
                </AnimatePresence>

                <motion.div
                    className="w-full h-full rounded-2xl shadow-lg bg-[#1c1c1c] cursor-pointer"
                    animate={{ rotateY: isClaimed ? 180 : 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    <div className="absolute w-full h-full backface-hidden">
                        {!unlocked ? (
                            isClaimable ? (
                                <button
                                    onClick={handleClaim}
                                    className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-red-500 rounded-2xl"
                                >
                                    Claim
                                </button>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <svg className="w-20 h-20">
                                        <circle
                                            className="text-gray-700"
                                            strokeWidth="5"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="30"
                                            cx="40"
                                            cy="40"
                                        />
                                        <circle
                                            className="text-gradient"
                                            strokeWidth="5"
                                            strokeDasharray="188.4"
                                            strokeDashoffset={`${188.4 - (progress / 100) * 188.4}`}
                                            strokeLinecap="round"
                                            stroke="url(#grad1)"
                                            fill="transparent"
                                            r="30"
                                            cx="40"
                                            cy="40"
                                        />
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#a855f7" />
                                                <stop offset="50/>%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#ef4444" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            )
                        ) : (
                            cardBack
                        )}
                    </div>
                    <div className="absolute w-full h-full backface-hidden transform rotateY-180">
                        {cardFront}
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default AchievementCard