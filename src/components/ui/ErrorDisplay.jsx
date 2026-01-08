import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorDisplay = ({
  error,
  title = "Error",
  className = "",
  onClear, // NEW
}) => {
  if (!error) return null;

  const formatFieldName = (fieldName) =>
    fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const renderErrorMessage = () => {
    // 1️⃣ FastAPI / validation array
    if (error?.detail && Array.isArray(error.detail)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {error.detail.map((item, index) => (
            <li key={index}>
              <span className="font-medium">
                {item.loc?.[1] ? formatFieldName(item.loc[1]) : "Validation"}:
              </span>{" "}
              {item.msg || "Invalid value"}
            </li>
          ))}
        </ul>
      );
    }

    // 2️⃣ detail is OBJECT → show message only ✅
    if (
      error?.detail &&
      typeof error.detail === "object" &&
      error.detail.message
    ) {
      return <p>{error.detail.message}</p>;
    }

    // 3️⃣ detail is STRING
    if (typeof error?.detail === "string") {
      return <p>{error.detail}</p>;
    }

    // 4️⃣ fallback message
    if (error?.message) return <p>{error.message}</p>;
    if (typeof error === "string") return <p>{error}</p>;

    // 5️⃣ last fallback
    try {
      return (
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
      );
    } catch {
      return <p>An unknown error occurred</p>;
    }
  };

  return (
    <div
      className={`relative mb-6 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      {/* Clear Button */}
      {onClear && (
        <button
          onClick={onClear}
          className="absolute top-3 right-3 text-red-400 hover:text-red-600"
          aria-label="Clear error"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            {renderErrorMessage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
