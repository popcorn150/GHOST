import { useState } from "react";
import NavBar from "../components/NavBar";
import faqsData from "./faqData";
import BackButton from "../components/BackButton";

const FAQs = () => {
    const [search, setSearch] = useState("");
    const [selectedFAQ, setSelectedFAQ] = useState(null);

    const filteredFAQs = faqsData.filter((faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-5">
            <BackButton />
                <h1 className="text-white text-xl text-center font-bold mb-4">FAQs</h1>

                <div>
                    <h2 className="text-white text-lg text-start font-semibold mb-4">How can we help you?</h2>
                    <input
                        type="text"
                        placeholder="Search for help articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 mb-4 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-white text-xl text-start tracking-wider font-semibold mb-4">Popular Topics</h2>
                    {!selectedFAQ ? (
                        <>
                            <ul className="space-y-4">
                                {filteredFAQs.map((faq) => (
                                    <li
                                        key={faq.id}
                                        className="p-4 border rounded cursor-pointer bg-gray-500 hover:bg-gray-100"
                                        onClick={() => setSelectedFAQ(faq)}
                                    >
                                        {faq.question}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-3 px-7">
                                <h4 className="text-white text-sm text-center"><b>Ghost - Secure Gaming Account Marketplace.</b></h4>
                            </div>
                        </>
                    ) : (
                        <div>
                            <button
                                onClick={() => setSelectedFAQ(null)}
                                className="mb-4 text-blue-600 hover:underline"
                            >
                                Back to FAQs
                            </button>
                            <h2 className="text-2xl text-white font-bold mb-2">{selectedFAQ.question}</h2>
                            {selectedFAQ.answers ? (
                                <ul className="list-disc ml-6">
                                    {selectedFAQ.answers.map((item) => (
                                        <li key={item.id} className="text-white">{item.answer}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white">{selectedFAQ.answer}</p>
                            )}
                            <div className="absolute bottom-0 pb-3 px-7">
                                <h4 className="text-white text-sm text-center"><b>Ghost - Secure Gaming Account Marketplace.</b></h4>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FAQs;