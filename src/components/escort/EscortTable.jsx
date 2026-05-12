// components/EscortTable.jsx
import React from "react";
import { Trash2, Eye, Edit, KeyRound, Users } from "lucide-react";

import ReusableButton from "../ui/ReusableButton";
import ReusableToggle from "../ui/ReusableToggle";

const GENDER_STYLES = {
  male:   { label: "Male",   className: "bg-blue-50 text-blue-700 border border-blue-200" },
  female: { label: "Female", className: "bg-pink-50 text-pink-700 border border-pink-200" },
  other:  { label: "Other",  className: "bg-purple-50 text-purple-700 border border-purple-200" },
};

const EscortTable = ({
  escorts,
  vendors,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleAvailable,
  onResetPassword,
  isLoading,
}) => {
  const getVendorName = (vendorId) =>
    vendors.find((v) => v.value === vendorId)?.label || "N/A";

  const getGenderBadge = (gender) => {
    const key = gender?.toLowerCase();
    const style = GENDER_STYLES[key];
    if (!style) return <span className="text-gray-400 text-sm">—</span>;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${style.className}`}>
        {style.label}
      </span>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!escorts || escorts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-base mb-1">No escorts found</p>
        <p className="text-gray-400 text-sm">Add an escort to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Table header bar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Showing <span className="text-gray-900 font-semibold">{escorts.length}</span> escort{escorts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Name", "Phone", "Email", "Vendor", "Gender", "Active", "Available", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {escorts.map((escort) => (
              <tr
                key={escort.escort_id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* ID */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {escort.escort_id}
                  </span>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {escort.name}
                  </span>
                </td>

                {/* Phone */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {escort.phone}
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {escort.email || <span className="text-gray-400">—</span>}
                </td>

                {/* Vendor */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700 font-medium">
                    {getVendorName(escort.vendor_id)}
                  </span>
                </td>

                {/* Gender */}
                <td className="px-4 py-3">
                  {getGenderBadge(escort.gender)}
                </td>

                {/* Active toggle */}
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

                {/* Available toggle */}
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

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ReusableButton
                      module="escort"
                      action="view"
                      icon={Eye}
                      title="View Escort"
                      onClick={() => onView(escort)}
                      className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="escort"
                      action="update"
                      icon={Edit}
                      title="Edit Escort"
                      onClick={() => onEdit(escort)}
                      className="text-gray-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="escort"
                      action="update"
                      icon={KeyRound}
                      title="Reset Password"
                      onClick={() => onResetPassword?.(escort)}
                      className="text-gray-500 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="escort"
                      action="delete"
                      icon={Trash2}
                      title="Delete Escort"
                      onClick={() => onDelete(escort.escort_id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
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