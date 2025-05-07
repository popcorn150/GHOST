import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

// eslint-disable-next-line react/prop-types
export default function SearchableBankSelect({ banks, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const dropdownRef = useRef(null);

  // Filter banks based on search term
  const filteredBanks =
    // eslint-disable-next-line react/prop-types
    banks?.filter((bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set the selected bank when value changes
  useEffect(() => {
    if (value && banks) {
      // eslint-disable-next-line react/prop-types
      const bank = banks?.find((b) => b.code === value);
      setSelectedBank(bank);
    }
  }, [value, banks]);

  const handleSelect = (bank) => {
    setSelectedBank(bank);
    setIsOpen(false);
    setSearchTerm("");
    onChange(bank.code);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block mb-1">Bank Code</label>

      {/* Selected value display */}
      <div
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex-grow">
          {selectedBank ? selectedBank.name : "Select a bank"}
        </div>
        <div className="ml-2">▼</div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="sticky top-0 p-2 bg-gray-700 border-b border-gray-600">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 pl-8 bg-gray-800 rounded focus:outline-none"
                placeholder="Search banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <Search
                className="absolute left-2 top-2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* Options list */}
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank) => (
              <div
                key={bank.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-600"
                onClick={() => handleSelect(bank)}
              >
                <div className="font-medium">{bank.name}</div>
                <div className="text-sm text-gray-400">Code: {bank.code}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-400">No banks found</div>
          )}
        </div>
      )}
    </div>
  );
}
