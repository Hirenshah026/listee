import React from "react";

interface SwitchProps {
  label?: string;
  checked: boolean; // Controlled
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  label = "",
  checked,
  disabled = false,
  onChange,
}) => {
  const handleToggle = () => {
    if (disabled) return;
    if (onChange) onChange(!checked);
  };

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 ${
        disabled ? "text-gray-400" : "text-gray-700"
      }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block h-6 w-11 rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
            checked ? "translate-x-full" : "translate-x-0"
          }`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
