// components/EscortTable.jsx
import React from "react";
import { Trash2, Eye, Edit } from "lucide-react";

import ReusableButton from "../ui/ReusableButton";
import ReusableToggle from "../ui/ReusableToggle";

const EscortTable = ({
  escorts,
  vendors,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleAvailable,
}) => {
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
                  <ReusableToggle
                    module="escort"
                    action="toggle-active"
                    isActive={escort.is_active}
                    onToggle={() => onToggleActive(escort)}
                    activeLabel="Active"
                    inactiveLabel="Inactive"
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <ReusableToggle
                    module="escort"
                    action="toggle-available"
                    isActive={escort.is_available}
                    onToggle={() => onToggleAvailable(escort)}
                    activeLabel="Available"
                    inactiveLabel="Unavailable"
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <ReusableButton
                      module="escort"
                      action="view"
                      icon={Eye}
                      title="View Escort"
                      onClick={() => onView(escort)}
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="escort"
                      action="update"
                      icon={Edit}
                      title="Edit Escort"
                      onClick={() => onEdit(escort)}
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="escort"
                      action="delete"
                      icon={Trash2}
                      title="Delete Escort"
                      onClick={() => onDelete(escort.escort_id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscortTable;
