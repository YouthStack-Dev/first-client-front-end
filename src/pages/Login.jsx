import { useState, useEffect } from "react";
import { Lock, Shield, Truck, User, Users, Key } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  resetAuthState,
  setAuthCredentials,
} from "../redux/features/auth/authSlice";
import Cookies from "js-cookie";
import { loginUser } from "../redux/features/auth/authTrunk";
import endpoint from "../Api/Endpoints";
import { logDebug } from "../utils/logger";

export const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    tenant_id: "", // New field for company/vendor ID
  });
  const [validationError, setValidationError] = useState("");
  const location = useLocation();

  const {
    error,
    loading: isLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function to extract error message
  const getErrorMessage = (error) => {
    if (!error) return "";

    // Handle string errors
    if (typeof error === "string") return error;

    // Handle error object with detail property
    if (error.detail) {
      // Check if detail is an object with message property
      if (typeof error.detail === "object" && error.detail.message) {
        return error.detail.message;
      }
      // Handle case where detail might be a string
      if (typeof error.detail === "string") {
        return error.detail;
      }
    }

    // Handle error object with message property
    if (error.message) {
      return error.message;
    }

    // Fallback for unknown error format
    return "An unexpected error occurred. Please try again.";
  };

  const getDashboardPath = () => {
    const path = location.pathname.toLowerCase();

    if (path.includes("superadmin")) {
      return "/superadmin/dashboard";
    } else if (path.includes("vendor")) {
      return "/vendor/dashboard";
    }

    return "/companies/profile"; // Default for company login
  };

  // Check if ID field is required based on login type
  const requiresIdField = () => {
    const path = location.pathname.toLowerCase();

    // Show ID field for all except superadmin if superadmin doesn't need it
    // Modify this based on your backend requirements
    if (path.includes("/superadmin")) {
      return false; // Superadmin doesn't need tenant_id (adjust based on your API)
    }

    return true; // Show for all other paths
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fromPath = location.state?.from || getDashboardPath();
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
    if (error) dispatch(resetAuthState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const path = location.pathname.toLowerCase();

    // Validation logic
    if (requiresIdField() && !credentials.tenant_id) {
      const titleInfo = getLoginTitle();
      setValidationError(`Please fill in your ${titleInfo.idLabel}.`);
      return;
    }

    // Email validation
    const usernameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usernameRegex.test(credentials.username)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (!credentials.password) {
      setValidationError("Please enter your password.");
      return;
    }

    try {
      // Prepare data for superadmin (without tenant_id if not required)
      const loginData = { ...credentials };
      if (path.includes("/superadmin") && !requiresIdField()) {
        delete loginData.tenant_id; // Remove tenant_id for superadmin
      }

      const result = await dispatch(
        loginUser({
          formData: loginData,
          endpoint: getLoginEndpoint(),
        })
      ).unwrap();

      logDebug("Login successful, ", result);

      dispatch(setAuthCredentials(result));

      // Optional: Set additional cookies if needed
      Cookies.set("user_username", result.user.username || "dummy", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Navigate to appropriate dashboard
      navigate(getDashboardPath(), { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      // Error is already handled in the Redux state
    }
  };

  const getLoginTitle = () => {
    const path = location.pathname.toLowerCase();

    if (path.includes("/superadmin")) {
      return {
        title: "Superadmin Login",
        subtitle: "System administration access",
        icon: <Shield className="w-8 h-8 text-red-600" />,
        idLabel: "",
        idPlaceholder: "",
        showIdField: false, // Explicit flag
      };
    } else if (path.includes("/vendor")) {
      return {
        title: "Vendor Login",
        subtitle: "Vendor portal access",
        icon: <Truck className="w-8 h-8 text-green-600" />,
        idLabel: "Vendor ID",
        idPlaceholder: "Enter your vendor ID",
        showIdField: true,
      };
    } else if (path.includes("/employee")) {
      return {
        title: "Employee Login",
        subtitle: "Employee portal access",
        icon: <User className="w-8 h-8 text-blue-600" />,
        idLabel: "Company ID",
        idPlaceholder: "Enter your company ID",
        showIdField: true,
      };
    } else {
      // Default company login
      return {
        title: "Company Login",
        subtitle: "Access your company dashboard",
        icon: <Users className="w-8 h-8 text-blue-600" />,
        idLabel: "Company ID",
        idPlaceholder: "Enter your company ID",
        showIdField: true,
      };
    }
  };

  const getLoginEndpoint = () => {
    const path = location.pathname.toLowerCase();

    if (path.includes("/superadmin")) {
      return endpoint.superAdminLogin;
    } else if (path.includes("/vendor")) {
      return endpoint.vendorLogin;
    }
    return endpoint.login; // Default endpoint for company and employee
  };

  const { title, subtitle, icon, idLabel, idPlaceholder, showIdField } =
    getLoginTitle();
  const displayError = validationError || getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">{icon}</div>
          <h2 className="text-3xl font-bold text-blue-700">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Error Messages */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <div className="flex items-start">
              <svg
                className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{displayError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID Field (only for company/vendor/employee login) */}
          {showIdField && (
            <div className="space-y-1">
              <label className="block text-gray-600 font-medium">
                {idLabel}
              </label>
              <div className="relative">
                <Key
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="tenant_id"
                  value={credentials.tenant_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={idPlaceholder}
                  autoComplete="organization"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-gray-600 font-medium">Email</label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-gray-600 font-medium">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
