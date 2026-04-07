import { useState, useEffect } from "react";
import {
  Lock,
  Shield,
  Truck,
  User,
  Users,
  Key,
  Building,
  Target,
  Globe,
  ShieldCheck,
  Clock,
  Users as UsersIcon,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
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
    tenant_id: "",
  });
  const [validationError, setValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const location = useLocation();

  const {
    error,
    loading: isLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    if (!error) return "";

    if (typeof error === "string") return error;

    if (error.detail) {
      if (typeof error.detail === "object" && error.detail.message) {
        return error.detail.message;
      }
      if (typeof error.detail === "string") {
        return error.detail;
      }
    }

    if (error.message) {
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  };

  const getDashboardPath = () => {
    const path = location.pathname.toLowerCase();

    if (path.includes("superadmin")) {
      return "/superadmin/dashboard";
    } else if (path.includes("vendor")) {
      return "/vendor/dashboard";
    }

    return "/companies/profile";
  };

  const requiresIdField = () => {
    const path = location.pathname.toLowerCase();

    if (path.includes("/superadmin")) {
      return false;
    }

    return true;
  };

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

    if (requiresIdField() && !credentials.tenant_id) {
      const titleInfo = getLoginTitle();
      setValidationError(`Please fill in your ${titleInfo.idLabel}.`);
      return;
    }

    const usernameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usernameRegex.test(credentials.username)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!credentials.password) {
      setValidationError("Please enter your password.");
      return;
    }

    try {
      const loginData = { ...credentials };
      if (path.includes("/superadmin") && !requiresIdField()) {
        delete loginData.tenant_id;
      }

      const result = await dispatch(
        loginUser({
          formData: loginData,
          endpoint: getLoginEndpoint(),
        })
      ).unwrap();

      logDebug("Login successful, ", result);

      dispatch(setAuthCredentials(result));

      Cookies.set("user_username", result.user.username || "dummy", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Show success state for 1 second before redirecting
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(getDashboardPath(), { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
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
        showIdField: false,
        companyName: "Admin Portal",
        tagline: "Secure System Administration",
      };
    } else if (path.includes("/vendor")) {
      return {
        title: "Vendor Login",
        subtitle: "Vendor portal access",
        icon: <Truck className="w-8 h-8 text-green-600" />,
        idLabel: "Vendor ID",
        idPlaceholder: "Enter your vendor ID",
        showIdField: true,
        companyName: "Vendor Portal",
        tagline: "Streamlined Vendor Management",
      };
    } else if (path.includes("/employee")) {
      return {
        title: "Employee Login",
        subtitle: "Employee portal access",
        icon: <User className="w-8 h-8 text-blue-600" />,
        idLabel: "Company ID",
        idPlaceholder: "Enter your company ID",
        showIdField: true,
        companyName: "Employee Portal",
        tagline: "Employee Self-Service Platform",
      };
    } else {
      return {
        title: "Company Login",
        subtitle: "Access your company dashboard",
        icon: <Users className="w-8 h-8 text-app-primary" />,
        idLabel: "Company ID",
        idPlaceholder: "Enter your company ID",
        showIdField: true,
        companyName: "Corporate Portal",
        tagline: "Comprehensive Business Management",
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
    return endpoint.login;
  };

  const {
    title,
    subtitle,
    icon,
    idLabel,
    idPlaceholder,
    showIdField,
    companyName,
    tagline,
  } = getLoginTitle();
  const displayError = validationError || getErrorMessage(error);

  const getButtonState = () => {
    if (loginSuccess) return "success";
    if (isLoading) return "loading";
    return "idle";
  };

  const buttonState = getButtonState();

  return (
    <div className="min-h-screen bg-app-background flex">
      {/* Left Side - Company Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar-primary to-app-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{companyName}</h1>
              <p className="text-white/80 mt-1">{tagline}</p>
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Enterprise Security
                </h3>
                <p className="text-white/80">
                  Bank-level encryption and secure authentication for all your
                  business data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Streamlined Operations
                </h3>
                <p className="text-white/80">
                  Manage your workforce, vendors, and resources all in one
                  unified platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-white/80">
                  Make data-driven decisions with live insights and
                  comprehensive reporting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10">
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-white/70" />
                <span className="text-white/70 text-sm">
                  Global Access • 24/7 Support
                </span>
              </div>
              <div className="flex items-center gap-3">
                <UsersIcon className="w-5 h-5 text-white/70" />
                <span className="text-white/70 text-sm">
                  Trusted by 500+ Companies
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-app-tertiary rounded-2xl mb-4 shadow-sidebar-item">
              {icon}
            </div>
            <h2 className="text-3xl font-bold text-app-text-primary">
              {title}
            </h2>
            <p className="text-app-text-muted mt-2">{subtitle}</p>
          </div>

          {/* Error Messages */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Field (only for company/vendor/employee login) */}
            {showIdField && (
              <div className="space-y-2">
                <label className="block text-app-text-secondary font-medium">
                  {idLabel}
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-app-text-muted"
                    size={20}
                  />
                  <input
                    type="text"
                    name="tenant_id"
                    value={credentials.tenant_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-app-border rounded-xl focus:ring-2 focus:ring-app-primary focus:border-transparent transition-all duration-200 bg-app-surface"
                    placeholder={idPlaceholder}
                    autoComplete="organization"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-app-text-secondary font-medium">
                Email
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-app-text-muted"
                  size={20}
                />
                <input
                  type="email"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-app-border rounded-xl focus:ring-2 focus:ring-app-primary focus:border-transparent transition-all duration-200 bg-app-surface"
                  placeholder="user@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-app-text-secondary font-medium">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-app-text-muted"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-app-border rounded-xl focus:ring-2 focus:ring-app-primary focus:border-transparent transition-all duration-200 bg-app-surface"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-app-text-muted hover:text-app-text-primary transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button — 3 states: idle / loading / success */}
            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${
                buttonState === "success"
                  ? "bg-green-500 focus:ring-green-500 cursor-default scale-[1.01]"
                  : buttonState === "loading"
                  ? "bg-app-secondary cursor-not-allowed focus:ring-app-primary"
                  : "bg-app-primary hover:bg-sidebar-primary shadow-sidebar-item hover:shadow-sidebar-item-hover focus:ring-app-primary"
              }`}
            >
              {buttonState === "success" ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Login Successful! Redirecting...
                </span>
              ) : buttonState === "loading" ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

          <p className="text-center text-sm text-app-text-muted mt-6">
            By logging in, you agree to our{" "}
            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
              className="text-app-primary underline hover:text-sidebar-primary transition-colors font-medium"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};