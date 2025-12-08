import React from "react";

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  placeholder,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <label className="text-sm text-gray-600">{label}</label>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border border-gray-300 rounded-md px-3 py-2 text-sm`}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((opt) => {
          const label = typeof opt === "string" ? opt : opt.label;
          const value = typeof opt === "string" ? opt : opt.value;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField;
