import { Link } from "react-router-dom";

const StaticPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-[#010409] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full bg-[#111827] border border-gray-800 rounded-3xl p-10 shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-300 leading-relaxed mb-6">{description || "This page is available for quick browsing without authentication."}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/categories"
            className="inline-flex justify-center items-center px-5 py-3 bg-[#4426B9] hover:bg-[#6C5DD3] rounded-xl text-white font-semibold transition"
          >
            Continue Browsing
          </Link>
          <Link
            to="/login"
            className="inline-flex justify-center items-center px-5 py-3 border border-gray-600 rounded-xl text-gray-200 hover:text-white hover:border-white transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
