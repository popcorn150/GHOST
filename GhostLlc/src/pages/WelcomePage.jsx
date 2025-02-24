import { auth, facebookProvider, googleProvider } from "../database/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { BackGround_, Facebook, Google, Logo, Title } from "../utils";

const WelcomePage = () => {

    const handleSignIn = async (providerType) => {
        const provider = providerType === "google" ? googleProvider : facebookProvider
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(`Authentication error: ${error}`);
        }
    };

    return (
        <div className="relative flex items-center justify-center bg-black w-full h-screen">
            <div className="opacity-50">
                <img src={BackGround_} alt="Games Background" className="w-full h-full object-cover" />
            </div>

            <div className="absolute flex flex-row items-center justify-between gap-40">
                <div className="flex flex-col items-center justify-center p-5">
                    <img src={Logo} alt="Ghost Logo" className="w-96 h-96" />
                    <img src={Title} alt="Title" className="w-56" />
                </div>

                <div className="flex flex-col items-center justify-center p-5">
                    <h1 className="text-white text-3xl font-bold">Sign In</h1>

                    <div className="grid gap-7 mt-5 p-14 rounded-xl bg-[#010409]">
                        <button onClick={() => handleSignIn("google")} className="flex items-center justify-center w-auto p-2 bg-white rounded-4xl shadow-md hover:cursor-pointer">
                            <img src={Google} alt="Google Icon" className="w-8 h-8 m-2" />
                            <span className="text-sm font-medium">Continue with Google</span>
                        </button>
                        <button onClick={() => handleSignIn("facebook")} className="flex items-center justify-center w-auto p-2 bg-white rounded-4xl shadow-md hover:cursor-pointer">
                            <img src={Facebook} alt="Facebook Icon" className="w-8 h-8 m-2" />
                            <span className="text-sm font-medium px-2">Continue with Facebook</span>
                        </button>
                        <p className="text-white text-center mt-5">
                            <a href="#">Terms of Service</a> & <span className="text-[#4426B9]">
                                <a href="#">Privacy Policy</a>
                            </span>
                        </p>
                    </div>
                </div>

            </div>
            <p className="absolute bottom-5 text-xs text-white">
                Copyright &copy; 2025 All rights reserved.
            </p>
        </div>
    )
}

export default WelcomePage