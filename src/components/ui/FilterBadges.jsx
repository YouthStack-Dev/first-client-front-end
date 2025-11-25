import React from "react";

const FilterBadges = ({ filters, onClear }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
        >
          {filter}
          {/* Optional: Add individual filter removal if needed */}
          {/* <button
            className="ml-2 text-blue-600 hover:text-blue-800"
            aria-label={`Remove ${filter} filter`}
          >
            <X size={14} />
          </button> */}
        </span>
      ))}
      <button
        onClick={onClear}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Clear All
      </button>
    </div>
  );
};

export default FilterBadges;
