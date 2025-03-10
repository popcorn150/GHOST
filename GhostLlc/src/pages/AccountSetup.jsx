import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackGround_, Logo, Title } from "../utils";

const AccountSetup = () => {
  // Existing states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // New state for country (email section removed)
  const [country, setCountry] = useState("Canada"); // default

  // New state to track if password mismatch error should be shown
  const [passwordError, setPasswordError] = useState(false);

  // Initialize navigate
  const navigate = useNavigate();

  const checkUsernameAvailability = async () => {
    // Mock API call for checking username
    const takenUsernames = ["ghost", "player1", "gamerx"];
    if (takenUsernames.includes(username.toLowerCase())) {
      setIsUsernameAvailable(false);
      setSuggestedUsernames([
        `${username}123`,
        `${username}_x`,
        `${username}-${Math.floor(Math.random() * 999)}`,
      ]);
    } else {
      setIsUsernameAvailable(true);
      setSuggestedUsernames([]);
    }
  };

  const validatePassword = (pwd) => {
    setPassword(pwd);
    if (pwd.length < 8) {
      setPasswordStrength("Too short!");
    } else if (
      !/[A-Za-z]/.test(pwd) ||
      !/\d/.test(pwd) ||
      !/[!@#$%^&*]/.test(pwd)
    ) {
      setPasswordStrength("Weak - Use letters, numbers & special characters");
    } else {
      setPasswordStrength("Strong");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate username availability
    if (!isUsernameAvailable) {
      alert("Choose another username");
      return;
    }

    // Validate password match: if they don't match, clear both and set error flag.
    if (password !== confirmPassword) {
      setPasswordError(true);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Validate password strength
    if (passwordStrength !== "Strong") {
      alert("Use a stronger password");
      return;
    }

    // Validate checkbox
    if (!isChecked) {
      alert("You must agree to the terms");
      return;
    }

    // If all checks pass, clear any password error flag and navigate.
    setPasswordError(false);
    alert("Account setup complete!");
    navigate("/categories");
  };

  // When user changes password fields, remove the password error flag
  const handlePasswordChange = (value) => {
    if (passwordError) setPasswordError(false);
    validatePassword(value);
  };

  return (
    <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-auto">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src={BackGround_}
          alt="Games Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
        {/* Logo & Title */}
        <div className="flex flex-row gap-3 md:flex-col items-center">
          <img
            src={Logo}
            alt="Ghost Logo"
            className="w-14 h-14 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
          <img src={Title} alt="Title" className="w-34 md:w-56" />
        </div>

        {/* Account Setup Form */}
        <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-md">
          <h1 className="text-white text-xl lg:text-2xl font-semibold mb-4">
            Finish Account Set-Up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ghost Username */}
            <div>
              <label className="text-white block mb-1">Ghost Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={checkUsernameAvailability}
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              />
              {!isUsernameAvailable && (
                <p className="text-red-500 text-sm mt-1">
                  Username taken. Try: {suggestedUsernames.join(", ")}
                </p>
              )}
            </div>

            {/* Country of Residence */}
            <div>
              <label className="text-white block mb-1">
                Country of Residence
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
              >
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="text-white block mb-1">Choose Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              />
              <p
                className={`text-sm mt-1 ${
                  passwordStrength === "Strong"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {passwordStrength}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-white block mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  if (passwordError) setPasswordError(false);
                  setConfirmPassword(e.target.value);
                }}
                className={`w-full p-2 bg-[#161B22] text-white rounded-md border ${
                  passwordError ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-[#4426B9]`}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center text-white">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
                className="mr-2 w-5 h-5"
              />
              <label className="text-sm">
                I am 13 years or older and agree to the{" "}
                <a href="#" className="text-[#4426B9] font-semibold">
                  Ghost Subscriber Agreement
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#4426B9] font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#4426B9] hover:bg-[#341d8c] hover:cursor-pointer text-white font-semibold p-2 rounded-md transition duration-200"
            >
              Proceed
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-3 text-xs text-white text-center">
        &copy; 2025 All rights reserved.
      </p>
    </div>
  );
};

export default AccountSetup;
