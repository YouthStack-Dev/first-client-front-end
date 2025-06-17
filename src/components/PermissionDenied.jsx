import { ShieldAlert } from "lucide-react"; // Optional: Replace with any icon library

const PermissionDenied = ({ message = "Access denied. Module permission not found." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <ShieldAlert size={48} className="text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Permission Denied</h2>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
  );
};

export default PermissionDenied;
    