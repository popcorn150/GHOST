import { BackGround_, Logo, Title } from "../utils"
import { Link } from "react-router-dom";

const AccountLogin = () => {
    return (
        <div className="relative flex items-center justify-center bg-[#010409] w-full h-screen overflow-hidden">
            <div className="absolute inset-0 opacity-50">
                <img src={BackGround_} alt="Games Background" className="w-full h-full object-cover" />
            </div>

            <div className="absolute flex flex-col items-center gap-8 px-6 md:flex-row md:gap-30">
                <div className="flex flex-row gap-3 md:flex-col items-center">
                    <img src={Logo} alt="Ghost Logo" className="w-14 h-14 md:w-48 md:h-48 lg:w-64 lg:h-64" />
                    <img src={Title} alt="Title" className="w-34 md:w-56" />
                </div>

                <div className="flex flex-col items-center bg-[#010409] p-7 md:p-14 rounded-xl w-full max-w-md">
                    <h1 className="text-white text-xl lg:text-2xl font-semibold mb-4">Login</h1>

                    <form className="space-y-4">
                        <div>
                            <label className="text-white block mb-1">Ghost Username</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-white block mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#4426B9] hover:bg-[#341d8c] hover:cursor-pointer text-white font-semibold p-2 rounded-md transition duration-200"
                            onClick={() => { alert('Login successful!') }}
                        >
                            Login
                        </button>

                        <p className="text-gray-400 text-center text-xs"><a href="#" className="no-underline">Forgotten Password?</a></p>

                        <h5 className="text-white text-sm text-center">Join Ghost and discover thousands
                            of gaming account for sale at your
                            finger tip.
                        </h5>

                        <Link to="/">

                            <button
                                type="submit"
                                className="w-full mt-5 bg-none border-2 border-gray-500 hover:cursor-pointer text-white text-xs font-medium p-2 rounded-md"
                            >
                                Create An Account
                            </button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AccountLogin