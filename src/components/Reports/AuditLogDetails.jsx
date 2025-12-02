import React from "react";
import { X, Clock, User } from "lucide-react";

const AuditLogDetails = ({ log, onClose }) => {
  if (!log) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 border-green-200";
      case "UPDATE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderChanges = () => {
    const { action, user, new_values } = log.audit_data;
    const userName = user.name;
    const userEmail = user.email;

    if (action === "CREATE") {
      const createdFields = Object.keys(new_values);
      if (createdFields.length === 0) return null;

      const fieldList = createdFields
        .map(
          (field) => `${formatFieldName(field)}: ${String(new_values[field])}`
        )
        .join(", ");

      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail})
            created a new record with {fieldList}
          </p>
        </div>
      );
    }

    if (action === "UPDATE" && new_values.old && new_values.new) {
      const changedFields = Object.keys(new_values.old).filter(
        (key) => new_values.old[key] !== new_values.new[key]
      );

      if (changedFields.length === 0) return null;

      const changeElements = changedFields.map((field, index) => {
        const oldValue = new_values.old[field];
        const newValue = new_values.new[field];
        return (
          <span key={field}>
            {index > 0 && ", "}
            {formatFieldName(field)} from{" "}
            <span className="text-red-600 font-medium line-through">
              "{String(oldValue) || "empty"}"
            </span>{" "}
            to{" "}
            <span className="text-green-600 font-medium">
              "{String(newValue) || "empty"}"
            </span>
          </span>
        );
      });

      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail})
            changed {changeElements}
          </p>
        </div>
      );
    }

    if (action === "DELETE") {
      const deletedFields = Object.keys(new_values);
      if (deletedFields.length === 0) return null;

      const fieldList = deletedFields
        .map(
          (field) => `${formatFieldName(field)}: ${String(new_values[field])}`
        )
        .join(", ");

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail})
            deleted a record that had {fieldList}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getActionBadgeColor(
                log.audit_data.action
              )} border`}
            >
              {log.audit_data.action}
            </div>
            <h2 className="text-lg font-bold text-white">Audit Log Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Basic Info - Compact */}
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Time:</span>
              <span className="text-gray-900">
                {formatDate(log.audit_data.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">By:</span>
              <span className="text-gray-900">
                {log.audit_data.user.name} ({log.audit_data.user.email})
              </span>
            </div>
          </div>

          {/* Changes in Single Sentence Format */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Changes Made
            </h3>
            {renderChanges()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetails;
