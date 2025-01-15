import { Edit, Trash } from "lucide-react";



export const InputFields = ({
  label,
  placeholder = "Enter value",
  type = "text",
  required = false,
  Icon = User, // Default icon
  id,
  name,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      {/* Label for the input */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label} {required && "*"}
      </label>

      {/* Input with icon */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        )}
        <input
          id={id}
          name={name}
          type={type}
          {...(type !== "file" && { value })} // Exclude value for file inputs
          onChange={onChange}
          required={required}
          className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-1 hover:ring-gray-400"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export const OptionInput = ({
  options = [], // Default to an empty array
  Icon,
  def = "Select an option", // Default placeholder for the dropdown
  required = false,
  label,
  value,
  onChange,
  name,
}) => {
  return (
    <div className="space-y-2">
      {/* Label for the dropdown */}
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && "*"}
      </label>

      {/* Dropdown with icon */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-1 hover:ring-gray-400"
        >
          <option value="">{def}</option>
          {options.length > 0 ? (
            options.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      </div>
    </div>
  );
};



 export const ActionButtons = () => {
  return (
    <>
      <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
        <Edit className="mr-1" size={16} />
        Edit
      </button>
      
    </>
  );
};
