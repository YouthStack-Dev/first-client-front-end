import { ShieldAlert } from "lucide-react";

const PermissionDenied = ({
  message = "Access denied. Module permission not found.",
  headerHeight = 64, // in px, adjust based on your header size
}) => {
  return (
    <div
      className="flex items-center justify-center bg-gray-50"
      style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
    >
      <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md border border-dashed border-gray-300 max-w-md">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Permission Denied
        </h2>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
      </div>
    </div>
  );
};

export default PermissionDenied;
