import { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff, Shield, Zap, Users, BarChart3, ChevronLeft, ChevronRight, Truck, MapPin, Calendar, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { resetAuthState } from "../redux/features/auth/authSlice";
import { loginUser } from "../redux/features/auth/authTrunk";
import { logDebug } from "../utils/logger";

export const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [validationError, setValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  
  const { 
    error, 
    loading: isLoading, 
    isAuthenticated 
  } = useSelector((state) => state.auth);
  
  logDebug(" this is the error in login page ", error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Services/Features data for slider
  const services = [
    {
      icon: <Truck className="w-12 h-12 text-sidebar-accent-400" />,
      title: "Fleet Management",
      description: "Comprehensive vehicle tracking, maintenance scheduling, and fleet optimization tools.",
      features: ["Real-time GPS tracking", "Maintenance alerts", "Fuel monitoring", "Performance analytics"]
    },
    {
      icon: <MapPin className="w-12 h-12 text-sidebar-accent-400" />,
      title: "Route Optimization",
      description: "AI-powered route planning to reduce costs and improve delivery efficiency.",
      features: ["Smart route planning", "Traffic optimization", "Delivery scheduling", "Cost reduction"]
    },
    {
      icon: <Users className="w-12 h-12 text-sidebar-accent-400" />,
      title: "Driver Management",
      description: "Complete driver lifecycle management with performance tracking and safety monitoring.",
      features: ["Driver profiles", "Performance tracking", "Safety scoring", "Training management"]
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-sidebar-accent-400" />,
      title: "Analytics & Reports",
      description: "Detailed insights and customizable reports for data-driven decision making.",
      features: ["Custom dashboards", "Automated reports", "KPI tracking", "Predictive analytics"]
    },
    {
      icon: <Calendar className="w-12 h-12 text-sidebar-accent-400" />,
      title: "Scheduling System",
      description: "Advanced scheduling for drivers, vehicles, and maintenance operations.",
      features: ["Shift management", "Resource allocation", "Automated scheduling", "Conflict resolution"]
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [services.length]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || '/dashboard');
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
    
    if (!credentials.username || !credentials.password) {
      setValidationError("Please fill in both email and password.");
      return;
    }
  
    try {
      const formData = new FormData();
      Object.keys(credentials).forEach(key => {
        formData.append(key, credentials[key]);
      });
  
      const result = await dispatch(loginUser(formData)).unwrap();
  
      if (result) {
        navigate(location.state?.from || '/welcome', { replace: true });
      }
  
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-sidebar-primary-50 to-sidebar-primary-100">
      {/* Left Section - Services Slider */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-sidebar-primary-800 via-sidebar-primary-6 00 to-sidebar-primary-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Header */}
          <div className="p-8 pb-4">
          <div className="flex items-center mb-4">
  {/* Logo */}
  <div className="w-1/8 h-1/3 bg-white rounded-lg flex items-center justify-center mr-4 overflow-hidden">
    <img 
      src="/icons/logo.jpeg" 
      alt="MLT ETS Logo" 
      className="w-full h-full object-contain"
    />
  </div>
  
  {/* Title */}
  <div>
    <h1 className="text-2xl font-bold">MLT Corporate Solution Pvt. Ltd.</h1>
    <p className="text-sidebar-primary-200 text-sm">Fleet Management Solutions</p>
  </div>
</div>

            <div className="h-1 w-24 bg-gradient-to-r from-sidebar-accent-400 to-sidebar-accent-600 rounded-full"></div>
          </div>

          {/* Slider Content */}
          <div className="flex-1 flex flex-col justify-center px-8 relative">
            <div className="mb-8">
              <div className="flex justify-center mb-8">
                {services[currentSlide].icon}
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-center">
                {services[currentSlide].title}
              </h2>
              
              <p className="text-xl text-sidebar-primary-100 mb-8 text-center leading-relaxed">
                {services[currentSlide].description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {services[currentSlide].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-sidebar-accent-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sidebar-primary-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="p-8 pt-4">
            <div className="flex justify-center space-x-2 mb-6">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-sidebar-accent-400 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-center justify-between text-center">
                <div>
                  <div className="text-2xl font-bold text-sidebar-accent-400">500+</div>
                  <div className="text-xs text-sidebar-primary-200">Active Fleets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sidebar-accent-400">99.9%</div>
                  <div className="text-xs text-sidebar-primary-200">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sidebar-accent-400">24/7</div>
                  <div className="text-xs text-sidebar-primary-200">Support</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-sidebar-primary-500 text-xs text-center">
                © 2024 MLT Corporate Solution Pvt. Ltd.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex w-full lg:w-2/5 items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Login Form Card */}
          <div className="bg-sidebar-primary-500 p-8 rounded-2xl shadow-lg border border-sidebar-primary-100/30 backdrop-blur-sm">
            {/* Company Logo Section */}
            <div className="text-center mb-8">
              {/* Large Company Logo with light background */}
              <div className="mx-auto w-32 h-32 bg-gradient-to-br bg-sidebar-primary-700 rounded-3xl flex items-center justify-center mb-4 shadow-lg border border-sidebar-primary-200/50">
                {/* Replace with actual company logo */}
                <img 
                  src="/company.logpng.png" 
                  alt="Company Logo" 
                  className="w-24 h-16 object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* Fallback icon if image fails to load */}
                <User className="w-16 h-16 text-sidebar-primary-500" style={{ display: 'none' }} />
              </div>
              
              {/* Company name with lighter styling */}
              <h1 className="text-2xl font-semibold text-sidebar-primary-700 mb-2">
                Your Company
              </h1>
              <p className="text-sm text-sidebar-primary-500">
                Welcome back
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sidebar-primary-50 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-sidebar-primary-700" />
                  </div>
                  <input
                    type="email"
                    name="username"
                    className="w-full pl-10 pr-4 py-3 border border-sidebar-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sidebar-primary-400 focus:border-sidebar-primary-400 transition-all duration-200 text-sm bg-sidebar-primary-25"
                    placeholder="Enter your email"
                    value={credentials.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sidebar-primary-50 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-sidebar-primary-700" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full pl-10 pr-12 py-3 border border-sidebar-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sidebar-primary-400 focus:border-sidebar-primary-400 transition-all duration-200 text-sm bg-sidebar-primary-25"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-sidebar-primary-800 hover:text-sidebar-primary-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-sidebar-primary-400 hover:text-sidebar-primary-600 transition-colors" />
                    )} 
                  </button>
                </div>
              </div>


              {/* Error Message */}
              {(validationError || error) && (
                <div className="bg-sidebar-danger-50 border border-sidebar-danger-200 text-sidebar-danger-700 px-4 py-3 rounded-xl text-xs">
                  {validationError || error}
                </div>
              )}

              {/* Submit Button with light gradient */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-sidebar-primary-400 to-sidebar-primary-500 text-white py-3 rounded-xl hover:from-sidebar-primary-500 hover:to-sidebar-primary-600 focus:outline-none focus:ring-2 focus:ring-sidebar-primary-400 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            

            {/* Decorative element */}
            <div className="mt-6 flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-sidebar-primary-300 to-transparent"></div>
            </div>
          </div>

          {/* Mobile Company Info */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-sidebar-primary-500 text-xs">
              Powered by <span className="font-semibold text-sidebar-primary-600"> MLT Corporate Solution Pvt. Ltd.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





