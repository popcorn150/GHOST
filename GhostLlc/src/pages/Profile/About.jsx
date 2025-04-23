const About = ({ bio, readOnly }) => {
  return (
    <div className="p-5">
      <textarea
        className="w-full h-60 p-3 border border-gray-600 rounded-md bg-[#0E1115] text-sm text-gray-400 focus:outline-none"
        value={bio || "No bio available."}
        readOnly={true}
        aria-label="User bio"
      ></textarea>
    </div>
  );
};

export default About;
