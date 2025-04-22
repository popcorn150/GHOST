import {
  FaSquareFacebook,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

const Socials = ({ socials, readOnly }) => {
  return (
    <div className="p-5">
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="facebook-input">
          Facebook
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaSquareFacebook className="text-blue-500" />
          </span>
          <input
            id="facebook-input"
            type="text"
            value={socials?.facebook || ""}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none"
            placeholder="No Facebook profile"
            readOnly={true}
            aria-label="Facebook profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="instagram-input">
          Instagram
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaInstagram className="text-pink-500" />
          </span>
          <input
            id="instagram-input"
            type="text"
            value={socials?.instagram || ""}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none"
            placeholder="No Instagram profile"
            readOnly={true}
            aria-label="Instagram profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="tiktok-input">
          TikTok
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaTiktok className="text-gray-200" />
          </span>
          <input
            id="tiktok-input"
            type="text"
            value={socials?.tiktok || ""}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none"
            placeholder="No TikTok profile"
            readOnly={true}
            aria-label="TikTok profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="twitter-input">
          Twitter
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaXTwitter className="text-gray-200" />
          </span>
          <input
            id="twitter-input"
            type="text"
            value={socials?.twitter || ""}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none"
            placeholder="No Twitter profile"
            readOnly={true}
            aria-label="Twitter profile URL"
          />
        </div>
      </div>
    </div>
  );
};

export default Socials;
