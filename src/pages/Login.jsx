import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";

import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { log, error } from "../utils/logger";
import { loginUser } from "../redux/features/auth/authTrunk";
import { setUser } from "../redux/features/auth/authSlice";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [validationMsg, setValidationMsg] = useState(""); // 🟢 new state

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setModulePermissions } = useContext(ModulePermissionContext);

  const { loading: isLoading, error: err, user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 Check if fields are empty
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setValidationMsg("⚠️ Please fill in all fields.");
      return;
    } else {
      setValidationMsg(""); // clear message if filled
    }

    try {
      const res = await dispatch(
        loginUser({ username: credentials.username, password: credentials.password })
      ).unwrap();

      log(" this is the login request data ", res);

      const token = res?.access_token;
      if (!token) {
        throw new Error("No token found in response");
      }

      const permissions = res?.permissions || [];
      log(" this is the module in the login ", permissions);
      setModulePermissions(permissions);

      const decoded = jwtDecode(token);
      // log("This is the decoded code ", decoded);


      localStorage.setItem("access_token", token);
      dispatch(setUser(decoded));

      // log("Token from localStorage:", localStorage.getItem("access_token"));

      navigate("/dashboard");
    } catch (err) {
      if (err.message === "Network Error") {
        log("Network error:", err);
        return;
      }
      error("❌ Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
      <img
    src="/mltlogo.webp"
    alt="Logo"
    className="mx-auto mb-4 w-44 h-24 object-contain rounded-ls "
  />
        <h2 className="text-ls font-bold text-center text-blue-700 mb-6">MLT CORPORATE SOLUTIONS PVT.LTD</h2>
        {/* 🔔 Show validation message if fields are empty */}
        {validationMsg && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center">
            {validationMsg}
          </div>
        )}

        {/* 🔴 Show error from backend */}
        {err && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-gray-600 mb-1 font-medium">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-600 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
