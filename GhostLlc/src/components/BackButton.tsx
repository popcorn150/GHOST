import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface BackButtonProps {
  className?: string;
  to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = "", to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center cursor-pointer gap-2 bg-[#2C2F33] rounded-lg py-2 px-4 hover:bg-[#2a2a32] transition-colors duration-200 font-medium text-white ${className}`}
    >
      <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
