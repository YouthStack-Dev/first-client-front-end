import React from 'react';

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  options = [],
  required = false,
  min,
  max,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => {
            // Handle both string options and object options
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <option key={optionValue || index} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
      )}
    </div>
  );
};

export default InputField;