import { useState, useEffect } from "react";
import { Lock, Shield, Truck, User, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { resetAuthState, setAuthCredentials } from "../redux/features/auth/authSlice";
import Cookies from "js-cookie";
import { loginUser } from "../redux/features/auth/authTrunk";
import endpoint from "../Api/Endpoints";

export const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [validationError, setValidationError] = useState("");
  const location = useLocation();
  
  const { 
    error, 
    loading: isLoading, 
    isAuthenticated 
  } = useSelector((state) => state.auth); 
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const path = location.pathname.toLowerCase();
  
    if (path.includes('superadmin')) {
      return '/superadmin/dashboard'; 
    } else if (path.includes('vendor')) {
      return '/vendor/dashboard';
    }
  
    return '/dashboard'; // Default for company login
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
    
    // Client-side validation
    if (!credentials.email || !credentials.password) {
      setValidationError("Please fill in both email and password.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    try {
      const result = await dispatch(loginUser({
        formData: credentials,
        endpoint: getLoginEndpoint()
      })).unwrap();
      
      dispatch(setAuthCredentials(result));
      
      // Optional: Set additional cookies if needed
      Cookies.set('user_email', result.user.email, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      console.log("Login successful", result);
      
      // Navigate to appropriate dashboard
      navigate(getDashboardPath(), { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      // Error is already handled in the slice
    }
  };

  const getLoginTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '') {
      return {
        title: "Company Login",
        subtitle: "Access your company dashboard",
        icon: <Users className="w-8 h-8 text-blue-600" />
      };
    } else if (path.includes('/superadmin')) {
      return {
        title: "Superadmin",
        subtitle: "System administration access",
        icon: <Shield className="w-8 h-8 text-red-600" />
      };
    } else if (path.includes('/vendor')) {
      return {
        title: "Vendor Login",
        subtitle: "Vendor portal access",
        icon: <Truck className="w-8 h-8 text-green-600" />
      };
    } else {
      return {
        title: "Login",
        subtitle: "Welcome back",
        icon: <User className="w-8 h-8 text-gray-600" />
      };
    }
  };

  const getLoginEndpoint = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '') {
      return endpoint.login; 
    } else if (path.includes('/superadmin')) {
      return endpoint.superAdminLogin;
    } else if (path.includes('/vendor')) {
      return endpoint.vendorLogin;
    }
    return endpoint.login; // Default endpoint
  };

  const { title, subtitle, icon } = getLoginTitle();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-blue-700">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Error Messages */}
        {(error?.message || validationError) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {validationError || error.message}
            {error?.details && (
              <ul className="mt-1 list-disc list-inside">
                {Object.entries(error.details).map(([field, errors]) => (
                  <li key={field}>{errors.join(', ')}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-gray-600 font-medium">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-gray-600 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : 'Login'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};