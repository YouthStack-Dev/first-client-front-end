import PropTypes from "prop-types";

const VehicleTypeList = ({
  items = [],
  headers = [],
  loading = false,
  onEdit = () => {},
  onDelete = () => {},
  emptyMessage = "No vehicle types found",
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto bg-white rounded-lg shadow ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  header.className || ""
                }`}
              >
                {header.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {headers.map((header) => (
                <td
                  key={`${item.id}-${header.key}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    header.className || ""
                  }`}
                >
                  {header.render
                    ? header.render(item)
                    : item[header.key] || "-"}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTypeList;
