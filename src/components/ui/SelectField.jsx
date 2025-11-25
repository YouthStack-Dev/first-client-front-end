import React from "react";

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <label className="text-sm text-gray-600">{label}</label>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
