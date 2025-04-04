import { useState } from "react";
import NavBar from "../components/NavBar";

const Doc = () => {
    const [search, setSearch] = useState("");
    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-5">
                <h1 className="text-white text-xl text-center font-bold mb-4">Ghost Account Ownership Transfer Guide</h1>

                <div>
                    <h1 className="text-white text-2xl text-start font-bold mb-4">Introduction</h1>
                    <p className="text-white text-base text-start font-normal mb-5">
                        This guide provides detailed instructions on how to transfer ownership
                        of game accounts securely and successfully. Different games have unique transfer processes,
                        so follow the steps carefully for each specific title.
                    </p>
                    <input
                        type="text"
                        placeholder="Search for a game guide..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 mb-4 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                </div>
            </div>
        </>
    );
}

export default Doc