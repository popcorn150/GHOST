import NavBar from "./NavBar";
import { MdOutlineCameraEnhance } from "react-icons/md";
import { AdminIcon } from "../../utils";
import { useState } from "react";

const tabs = ["Uploads", "Bio", "Socials"];

const Layout = ({ activeTab, setActiveTab, children }) => {
    return (
        <>
            <NavBar />
            <div className="flex flex-col items-center justify-center p-3">
                <div className="my-10 relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-blue-500">
                    <img src={AdminIcon} alt="Profile" className="w-full h-full object-cover" />

                    <label
                        htmlFor="file-upload"
                        className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
                    >
                        <MdOutlineCameraEnhance className="text-white w-5 h-5" />
                    </label>

                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <div className="w-full px-24 mx-auto">
                    <div className="flex justify-between border-b relative">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 flex-1 text-center relative cursor-pointer ${activeTab === tab ? "text-white font-semibold" : "text-gray-400"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full h-1 bg-[#0E1115] border-none">
                        <div className="h-full bg-purple-500 transition-all duration-300"
                            style={{ width: "20%", transform: `translateX(${tabs.indexOf(activeTab) * 200}%)` }}
                        ></div>
                    </div>

                    <div className="mt-6 w-full">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

const Uploads = () => {
    const [accountImage, setAccountImage] = useState(null);
    const [screenshots, setScreenshots] = useState([]);
    const maxScreenshots = 5;

    const handleAccountImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAccountImage(imageUrl);
        }
    };

    const handleScreenshotUpload = (event) => {
        if (screenshots.length < maxScreenshots) {
            const file = event.target.files[0];
            if (file) {
                setScreenshots([...screenshots, URL.createObjectURL(file)]);
            }
        }
    };

    return (
        <div className="p-5">
            <div className="flex flex-col md:flex-row justify-between gap-5">
                <div className="grid max-w-4xl gap-4">
                    <div className="w-full flex flex-col items-start md:items-start">
                        <label htmlFor="account-image-upload" className="w-80 md:w-[500px] h-60 md:h-[300px] border-2 border-blue-500 rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                            {accountImage ? <img src={accountImage} alt="Account" className="w-full h-full object-cover" /> : <MdOutlineCameraEnhance className="text-gray-500 w-20 h-20" />}
                            {!accountImage && <p className="text-gray-400 text-sm text-center mt-5">Click to upload account image</p>}
                        </label>
                        <input id="account-image-upload" type="file" accept="image/*" className="hidden" onChange={handleAccountImageUpload} />
                    </div>

                    <input type="text" placeholder="Name of Account" className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]" required />
                    <input type="text" placeholder="Account Credential" className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]" required />
                    <input type="number" placeholder="Account's Worth" className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]" required />
                </div>

                <div>
                    <textarea placeholder="Full Account Description" className="w-full md:w-[500px] h-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]" required />
                </div>
            </div>

            <div className="mt-6 border border-gray-300 p-5 rounded-lg">
                <p className="text-white text-lg my-2">Screenshots</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {screenshots.map((src, index) => (
                        <img key={index} src={src} alt="Screenshot" className="w-full h-40 object-cover rounded-md" />
                    ))}
                    {screenshots.length < maxScreenshots && (
                        <label htmlFor="screenshot-upload" className="w-full h-40 rounded-md flex items-center justify-center bg-gray-700 cursor-pointer">
                            <MdOutlineCameraEnhance className="text-white w-10 h-10" />
                        </label>
                    )}
                </div>
                <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
            </div>
            <div className="flex justify-end my-5 gap-5">
                <button className="text-white font-medium bg-red-500 px-4 py-2 rounded cursor-pointer">Discard</button>
                <button className="text-white font-medium bg-purple-500 px-4 py-2 rounded cursor-pointer">Upload</button>
            </div>
        </div>
    );
};

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState("Uploads");

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === "Uploads" && <Uploads />}
            {activeTab === "Bio" && <div className="text-center text-white text-2xl">Bio</div>}
            {activeTab === "Socials" && <div className="text-center text-white text-2xl">Socials</div>}
        </Layout>
    );
}

export default UserProfile