import NavBar from "../components/NavBar"
import BackButton from "../components/BackButton";
import { Link } from "react-router-dom";
import { InstagramIcon, TwitterIcon, YoutubeIcon } from "../utils"

const InstagramPage = 'https://www.instagram.com/kingdave00.1/'
const TwitterPage = 'https://x.com/BareBoneStudio'
const YoutubePage = 'https://www.youtube.com/@BareBonesStudio_0_0'

const Community = () => {
    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-5">
                <BackButton />
                <h1 className="text-lg md:text-xl text-white text-center font-bold my-20 mb-10">Connect With Us Live On Our Socials</h1>

                <div className="flex flex-wrap justify-center gap-10 mx-10 my-5 p-10 bg-gray-900 rounded-xl">
                    {[
                        { icon: InstagramIcon, link: InstagramPage, alt: "Instagram" },
                        { icon: TwitterIcon, link: TwitterPage, alt: "Twitter" },
                        { icon: YoutubeIcon, link: YoutubePage, alt: "YouTube" }
                    ].map(({ icon, link, alt }) => (
                        <Link to={link} key={alt}>
                            <button
                                className="p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                            >
                                <img src={icon} alt={alt} className="md:w-20 md:h-20 sm:w-10 sm:h-10" />
                            </button>
                        </Link>
                    ))} 
                </div>

                <div className="py-5 px-2">
                    <h4 className="text-white text-sm font-medium md:text-[#010409] text-center"><b>Ghost - Secure Gaming Account Marketplace.</b></h4>
                </div>
            </div>
        </>
    )
}

export default Community