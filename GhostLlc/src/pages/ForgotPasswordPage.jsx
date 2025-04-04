import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../database/firebaseConfig";
import { BackGround_, Logo, Title } from "../utils";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Wrapper for Ghost + Box */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-0">
        {/* Ghost Symbol + Title - now flowing with the UI */}
        <div className="flex flex-col items-center gap-3 mb-6 mt-10">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-16 h-16 md:w-24 md:h-24"
          />
          <img src={Title} alt="Title" className="w-40 md:w-56" />
        </div>

        {/* Reset Password Box */}
        <div className="bg-[#010409] p-8 rounded-lg max-w-md w-full text-white border border-gray-700 shadow-md">
          <h2 className="text-lg font-bold mb-4 text-center">Reset Password</h2>

          {error && (
            <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm mb-2 text-center">{success}</p>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 bg-[#161B22] text-white border border-gray-600 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4426B9] hover:bg-[#341d8c] p-2 rounded-md font-semibold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>

            <p
              className="text-sm text-blue-400 text-center underline cursor-pointer mt-3"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-xs text-white text-center">
        Copyright &copy; {new Date().getFullYear()} All rights reserved.
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
