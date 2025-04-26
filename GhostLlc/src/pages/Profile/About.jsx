const About = ({ bio, readOnly }) => {
  return (
    <div className="p-5">
      <textarea
        className="w-full h-60 p-3 text-sm text-gray-400"
        value={bio || "No bio available."}
        readOnly={true}
        aria-label="User bio"
      ></textarea>
    </div>
  );
};

export default About;
