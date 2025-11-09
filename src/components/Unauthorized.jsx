import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertTriangle } from "lucide-react";
import { logDebug } from "../utils/logger";

const Unauthorized = () => {
  const navigate = useNavigate();

  // Access user info from Redux
  const { user } = useSelector((state) => state.auth); // adjust slice name if different

  logDebug("Unauthorized access attempt by user:", user);

  // Determine the dashboard path based on user type
  const getDashboardPath = () => {
    if (!user?.type) return "/login"; // fallback if user not found

    switch (user.type.toLowerCase()) {
      case "employee":
        return "/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "superadmin":
        return "/superadmin/dashboard";
      default:
        return "/dashboard";
    }
  };

  const handleReturn = () => {
    navigate(getDashboardPath());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <button
          onClick={handleReturn}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
