import { DELAY_TYPE_OPTIONS, DELAY_CATEGORY_OPTIONS } from "../../staticData/StaticReport";

const DelayFilters = ({
  formData,
  handleChange,
  loading,
}) => {
  return (
    <div className="space-y-6">

      {/* Delay Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Delay Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* All option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delay_type"
              value=""
              checked={!formData.delay_type}
              onChange={() => handleChange("delay_type", "")}
              className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}>
              All
            </span>
          </label>

          {DELAY_TYPE_OPTIONS.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="delay_type"
                value={type}
                checked={formData.delay_type === type}
                onChange={() => handleChange("delay_type", type)}
                className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <span className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}>
                {type.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Delay Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Delay Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* All option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delay_category"
              value=""
              checked={!formData.delay_category}
              onChange={() => handleChange("delay_category", "")}
              className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}>
              All
            </span>
          </label>

          {DELAY_CATEGORY_OPTIONS.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="delay_category"
                value={category}
                checked={formData.delay_category === category}
                onChange={() => handleChange("delay_category", category)}
                className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <span className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}>
                {category.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DelayFilters;