import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (val: string) => {
    if (disabled) return; // ⛔ disabled guard

    if (value === undefined) {
      setInternalValue(val);
    }
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          readOnly={disabled}                 // ✅ important
          disabled={disabled}                // ✅ html disabled
          className={`h-11 w-full rounded-lg border px-4 pr-10 py-2.5 text-sm shadow-xs
            ${
              disabled
                ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
            ${selectedValue ? "text-gray-800" : "text-gray-400"}
          `}
          value={
            isOpen
              ? search
              : options.find((o) => o.value === selectedValue)?.label || ""
          }
          onFocus={() => {
            if (!disabled) setIsOpen(true); // ⛔ disabled check
          }}
          onChange={(e) => {
            if (!disabled) setSearch(e.target.value);
          }}
        />

        {/* Arrow */}
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen && !disabled ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown */}
      {!disabled && isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                onClick={() => handleChange(opt.value)}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Select;
