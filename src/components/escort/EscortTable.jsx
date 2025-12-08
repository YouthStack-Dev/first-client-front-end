// components/EscortTable.jsx
import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";

const EscortTable = ({ escorts, vendors, onView, onEdit, onDelete }) => {
  const getVendorName = (vendorId) => {
    return vendors.find((v) => v.value === vendorId)?.label || "N/A";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Active
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Available
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {escorts.map((escort) => (
              <tr
                key={escort.escort_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {escort.escort_id}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {escort.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {escort.phone}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {escort.email || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getVendorName(escort.vendor_id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {escort.gender || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    isActive={escort.is_active}
                    activeText="Active"
                    inactiveText="Inactive"
                    activeClass="bg-green-100 text-green-800"
                    inactiveClass="bg-red-100 text-red-800"
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    isActive={escort.is_available}
                    activeText="Available"
                    inactiveText="Unavailable"
                    activeClass="bg-blue-100 text-blue-800"
                    inactiveClass="bg-gray-100 text-gray-800"
                  />
                </td>
                <td className="px-4 py-3">
                  <ActionButtons
                    onView={() => onView(escort)}
                    onEdit={() => onEdit(escort)}
                    onDelete={() => onDelete(escort.escort_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge = ({
  isActive,
  activeText,
  inactiveText,
  activeClass,
  inactiveClass,
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isActive ? activeClass : inactiveClass
    }`}
  >
    {isActive ? activeText : inactiveText}
  </span>
);

const ActionButtons = ({ onView, onEdit, onDelete }) => (
  <div className="flex gap-2">
    <button
      onClick={onView}
      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
      title="View"
    >
      <Eye size={16} />
    </button>
    <button
      onClick={onEdit}
      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
      title="Edit"
    >
      <Edit2 size={16} />
    </button>
    <button
      onClick={onDelete}
      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export default EscortTable;
