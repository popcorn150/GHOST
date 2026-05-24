import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BackGround_, Logo, Title, Google } from "../utils";
import "../App.css";
import { Toaster, toast } from "sonner";

const AccountLogin = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      toast.error("Please fill in both fields to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/categories");
    }, 200);
  };

  const handleGoogleSignIn = () => {
    navigate("/categories");
  };

  const handleGuestLogin = () => {
    navigate("/categories");
  };

  const handleCreateAccount = () => {
    navigate("/sign-up");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#010409] w-full overflow-hidden">
      <Toaster richColors position="top-center" />
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Games Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative my-5 flex w-full max-w-6xl flex-col items-center gap-8 px-6 md:flex-row md:gap-12">
        <div className="flex flex-row gap-3 md:flex-col items-center">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-14 h-14 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
          <img src={Title} alt="Title" className="w-32 md:w-56" />
        </div>

        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-md">
          <h1 className="text-white text-xl lg:text-2xl font-semibold mb-4">
            Login
          </h1>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-white block mb-1">Email or Username</label>
              <input
                type="text"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-white block mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4426B9] hover:bg-[#341d8c] text-white font-semibold p-2 rounded-md transition duration-200"
              disabled={loading}
            >
              {loading ? "Loading..." : "Log In"}
            </button>

            <p className="text-gray-400 text-center text-xs">
              <Link to="/forgot-password" className="underline text-blue-400">
                Forgotten Password?
              </Link>
            </p>

            <h6 className="text-white text-xs text-center">
              Join Ghost and discover thousands of gaming accounts for sale at
              your fingertips.
            </h6>

            <button
              type="button"
              onClick={handleCreateAccount}
              className="w-full mt-5 border-2 border-gray-500 text-white text-xs font-medium p-2 rounded-md hover:bg-gray-700 transition"
              disabled={loading}
            >
              Create An Account
            </button>
          </form>

          <div className="flex flex-col items-center mt-6 w-full gap-3">
            <button
              onClick={handleGuestLogin}
              className="w-full bg-[#1F2937] text-white font-semibold p-2 rounded-md hover:bg-[#111827] transition duration-200"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Free Login as Guest"}
            </button>
            <p className="text-white text-sm mb-2">OR</p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center p-2 bg-white text-gray-800 rounded-md shadow-md hover:bg-gray-100 transition duration-200"
              disabled={loading}
            >
              <img src={Google} alt="Google Logo" className="w-6 h-6 mr-2" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLogin;
