import { useNavigate } from "react-router-dom";
import {
  auth,
  facebookProvider,
  googleProvider,
} from "../database/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { BackGround_, Facebook, Google, Logo, Title } from "../utils";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSignIn = async (providerType) => {
    const provider =
      providerType === "google" ? googleProvider : facebookProvider;
    try {
      await signInWithPopup(auth, provider);
      // Navigate to the AccountSetup page after sign in
      navigate("/setup");
    } catch (error) {
      console.error(`Authentication error: ${error}`);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Games Background"
          className="w-full h-full object-cover"
        />
      </div>


      {/* Content Wrapper */}
      <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-20">
        {/* Logo & Title */}
        <div className="flex flex-col items-center">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-32 h-32  md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
          <img src={Title} alt="Title" className="w-40 md:w-56" />

            {/* Content Wrapper */}
            <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-20">
                {/* Logo & Title */}
                <div className="flex flex-col items-center">
                    <img src={Logo} alt="Ghost Logo" className="w-32 h-32  md:w-48 md:h-48 lg:w-64 lg:h-64" />
                    <img src={Title} alt="Title" className="w-40 md:w-56" />
                </div>

                {/* Sign-In Section */}
                <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-sm">
                    <h1 className="text-white text-2xl md:text-3xl font-bold">Sign In</h1>

                    {/* Buttons */}
                    <div className="grid gap-5 mt-5 w-full">
                        <button onClick={() => handleSignIn("google")}
                            className="flex items-center justify-center w-full p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md hover:cursor-pointer transition duration-200">
                            <img src={Google} alt="Google Icon" className="w-6 h-6 mr-2" />
                            <span className="text-sm font-medium">Continue with Google</span>
                        </button>
                        <button onClick={() => handleSignIn("facebook")}
                            className="flex items-center justify-center w-full p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md hover:cursor-pointer transition duration-200">
                            <img src={Facebook} alt="Facebook Icon" className="w-6 h-6 mr-2" />
                            <span className="text-sm font-medium">Continue with Facebook</span>
                        </button>
                    </div>

                    <p className="text-gray-400 text-center text-xs my-3">Already have an account?</p>

                    <Link to="/login">
                        <button
                            type="submit"
                            className="w-full mt-5 bg-none border-2 border-gray-500 hover:cursor-pointer text-white text-xs font-medium p-2 rounded-md"
                        >
                            Login to existing account
                        </button>
                    </Link>

                    {/* Terms & Policy */}
                    <p className="text-white text-sm text-center mt-5">
                        <a href="#">Terms of Service</a> & <a href="#" className="text-[#4426B9]">Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <p className="absolute bottom-5 text-xs text-white text-center">
                Copyright &copy; 2025 All rights reserved.
            </p>

        </div>

        {/* Sign-In Section */}
        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-sm">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Sign In</h1>

          {/* Buttons */}
          <div className="grid gap-5 mt-5 w-full">
            <button
              onClick={() => handleSignIn("google")}
              className="flex items-center justify-center w-full p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md hover:cursor-pointer transition duration-200"
            >
              <img src={Google} alt="Google Icon" className="w-6 h-6 mr-2" />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button
              onClick={() => handleSignIn("facebook")}
              className="flex items-center justify-center w-full p-3 bg-white hover:bg-gray-300 rounded-3xl shadow-md hover:cursor-pointer transition duration-200"
            >
              <img
                src={Facebook}
                alt="Facebook Icon"
                className="w-6 h-6 mr-2"
              />
              <span className="text-sm font-medium">
                Continue with Facebook
              </span>
            </button>
          </div>

          {/* Terms & Policy */}
          <p className="text-white text-sm text-center mt-5">
            <a href="#">Terms of Service</a> &{" "}
            <a href="#" className="text-[#4426B9]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-xs text-white text-center">
        Copyright &copy; 2025 All rights reserved.
      </p>
    </div>
  );
};

export default WelcomePage;
