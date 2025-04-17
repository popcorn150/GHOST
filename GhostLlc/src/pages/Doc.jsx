import { useRef, useState } from "react";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import gameDoc from "./gameDoc";
// import emailjs from "@emailjs/browser";

const Doc = () => {
    const [search, setSearch] = useState("");

    const filteredDocs = Array.isArray(gameDoc)
        ? gameDoc.filter((Doc) =>
            Doc.game.toLowerCase().includes(search.toLowerCase())
        ) : [];

    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-5">
                <BackButton />
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

                {filteredDocs.map((game) => (
                    <div key={game.id} className="mb-10 border-b border-white/10 pb-8">
                        <h3 className="text-white text-xl md:text-2xl font-semibold mb-4">
                            {game.game}
                        </h3>

                        <div className="mb-4">
                            <h4 className="text-white text-lg font-medium mb-2">
                                Steps to Transfer Ownership:
                            </h4>
                            <ul className="text-white space-y-2 list-disc ml-5">
                                {game.steps.map((step) => (
                                    <li key={step.id}>
                                        {step.step}
                                        {step.list && (
                                            <ul className="list-decimal ml-6 mt-2 space-y-1">
                                                {step.list.map((sub, i) => (
                                                    <li key={i}>
                                                        {sub.step}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg text-white font-medium mb-2">
                                Precautions:
                            </h4>
                            <ul className="space-y-2 list-disc ml-5 text-red-300">
                                {game.precautions.map((precaution) => (
                                    <li key={precaution.id}>
                                        {precaution.step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                <section className="mb-10 bg-gradient-to-br from-blue-800 to-purple-800 p-5 rounded-2xl shadow-lg">
                    <h2 className="text-white text-xl md:text-2xl font-bold mb-2">
                        🎮 Share a Guide & Get Rewarded!
                    </h2>
                    <p className="mb-4 text-white">
                        Know how to transfer ownership for a game we haven’t covered yet?
                        Submit your step-by-step guide and tag us on X (Twitter).
                        If your guide is verified, we’ll upload it publicly,
                        give you a shoutout, and even drop a reward! 🎁
                    </p>
                </section>

                <GuideUploadForm />
            </div>

            <div className="relative bottom-0 pb-3 px-7">
                <h4 className="text-white text-sm text-center"><b>Ghost - Secure Gaming Account Marketplace.</b></h4>
            </div>
        </>
    );
}

const GuideUploadForm = () => {
    const formRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = formRef.current;
        if (!form) return;

        const formData = {
            name: form.name.value,
            email: form.email.value,
            title: form.title.value,
            message: form.message.value
        };

        const serviceID = 'service_bi18dxk';
        const userTemplateID = 'template_fdhifdx';
        const ghostTemplateID = 'template_ws1e4pv';
        const publicKey = 'NWRHwzniQ3Ke5CkXt';

        // Send to Ghost email
        emailjs.send(serviceID, ghostTemplateID, formData, publicKey)
            .then(() => {
                console.log('Sent to Ghost successfully');
            })
            .catch((error) => {
                console.error('Error sending to Ghost:', error);
            });


        // Send confirmation to user
        emailjs.send(serviceID, userTemplateID, formData, publicKey)
            .then(() => {
                console.log('Confirmation sent to user');
                alert('Submitted successfully!');
                form.reset(); // Optional: clear the form
            })
            .catch((error) => {
                console.error('Error sending confirmation:', error);
                alert('Something went wrong. Please try again.');
            });
    };

    return (
        <div className="my-3">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">Submit Your Ownership Guide</h2>
            <p className="text-gray-500 mb-8 text-center">
                Help us keep Ghost up to date.
                Submit accurate ownership guides and earn rewards when your submission is approved.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-2xl">
                <div>
                    <label className="block text-sm font-medium text-white">
                        Twitter Username
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="@username"
                        required
                        className="w-full p-2 mt-3 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                </div>

                <div>
                    <label className="blobk text-sm font-medium text-white">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        className="w-full p-2 mt-3 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white">
                        Game Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Call of Duty: Modern Warfare"
                        required
                        className="w-full p-2 mt-3 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white">
                        Ownership Guide Details
                    </label>
                    <textarea
                        name="message"
                        rows={6}
                        placeholder="Include steps, screenshots (optional links), and anything that helps others verify and use the account..."
                        required
                        className="w-full p-2 mt-3 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-br from-blue-800 to-purple-800 text-white py-3 rounded-xl cursor-pointer"
                >
                    Submit Guide
                </button>
            </form>
        </div>
    )
}

export default Doc