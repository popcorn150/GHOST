import "../App.css";
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom";
import availableAccounts from "../constants";
import categoryAccounts from "../constants/category";
import NavBar from "../components/NavBar";
import { AdminIcon } from "../utils";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";


const AccountDetails = () => {
    const { slug } = useParams();
    const [loadingImages, setLoadingImages] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    let account = availableAccounts.find((acc) => acc.slug === slug);

    if (!account) {
        for (const category of categoryAccounts) {
            const foundGame = category.games.find((game) => game.slug === slug);
            if (foundGame) {
                account = foundGame;
                break;
            }
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => setLoadingImages(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleImageClick = (index) => {
        setSelectedImage(index);
    };

    const handleNext = () => {
        setSelectedImage((prev) => (prev + 1) % account.screenShots.length);
    };

    const handlePrev = () => {
        setSelectedImage((prev) => (prev - 1 + account.screenShots.length) % account.screenShots.length);
    };

    if (!account) {
        return <div className="text-center text-red-500">Account not found</div>;
    }

    return (
        <>
            <NavBar />
            <div className="p-5 bg-gray-900 min-h-screen text-white">
                <div className="flex flex-col md:flex-row justify-between gap-7 mt-5">
                    <div className="max-w-4xl">
                        {/* Account Header */}
                        <div className="flex flex-col items-start md:items-start gap-4">
                            <img src={account.img} alt={account.title} className="w-[500px] h-[300px] object-cover rounded-md" />
                            <div>
                                <h1 className="text-md md:text-xl font-bold">{account.title}</h1>
                                <span className="flex justify-between items-center mt-2">
                                    <p className="text-gray-400 mr-44">{account.views} Total Views</p>
                                    <Link to={'/profile'}>
                                        <img src={AdminIcon} alt="admin" className="w-8 md:w-10 hover:cursor-pointer" />
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="w-auto md:w-[50%] h-auto border p-4 rounded-lg">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-2">Details</h2>
                        <p className="text-gray-300">{account.details}</p>
                    </div>
                </div>

                {/* Screenshots */}
                {account.screenShots && account.screenShots.length > 0 && (
                    <div className="mt-6 border p-5 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Screenshots</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 cursor-pointer">
                            {loadingImages ? (
                                account.screenShots.map((shot, index) => (
                                    <div key={index} className="w-full h-40 bg-gray-300 animate-pulse rounded-md flex items-center justify-center">
                                        <div className="category-loader w-10 h-10 rounded-full animate-spin"></div>
                                    </div>
                                ))
                            ) : (
                                account.screenShots.map((shot, index) => (
                                    <img
                                        key={shot.id}
                                        src={shot.img}
                                        alt="screenshot"
                                        className="w-full h-40 object-cover rounded-md"
                                        onClick={() => handleImageClick(index)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox for Screenshots */}
            {selectedImage !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 text-white text-3xl cursor-pointer">
                        <GiCancel className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                    <button
                        onClick={handlePrev}
                        className="absolute left-5 text-white text-3xl cursor-pointer">
                        <FaArrowLeft className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                    <img
                        src={account.screenShots[selectedImage].img}
                        alt="Screenshot"
                        className="max-w-[90%] max-h-[80vh] rounded-lg"
                    />
                    <button
                        onClick={handleNext}
                        className="absolute right-5 text-white text-3xl cursor-pointer"
                    >
                        <FaArrowRight className="w-8 h-w-8 md:w-10 md:h-10" />
                    </button>
                </div>
            )}
        </>
    )
}

export default AccountDetails