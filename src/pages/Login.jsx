// src/pages/Login.jsx

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice"; // ✅ Corrected
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { API_CLIENT } from "../Api/API_Client";

const Login = () => {
  const [credentials, setCredentialsState] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setModulePermissions } = useContext(ModulePermissionContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credentials.username || !credentials.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      console.log("Sending form data:", formData.toString());

      const response = await API_CLIENT.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      console.log("API response:", response.data);

      const token = response.data.access_token;
      if (!token) throw new Error("No token found");

      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);

      const expirationTime = decoded.exp * 1000;
      Cookies.set("auth_token", token, {
        expires: new Date(expirationTime),
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // ✅ Dispatch to authSlice with both user and token
      dispatch(setCredentials({ user: decoded, token }));

      // ✅ Update context
      setModulePermissions(decoded?.permissions || []);

      console.log("Navigating to /dashboard");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      if (err?.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err?.response?.status === 422) {
        setError(err.response?.data?.message || err.response?.data?.error || "Invalid input. Please check your credentials.");
      } else if (err?.message === "Network Error") {
        setError("Server not connected");
      } else {
        setError("Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">MLT ETS Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
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
                onChange={(e) =>
                  setCredentialsState({ ...credentials, username: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter username"
                required
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
                onChange={(e) =>
                  setCredentialsState({ ...credentials, password: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-700 border-t pt-4">
          <p className="text-center font-medium">Demo Accounts</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>Super Admin: <b>superadmin</b> / 123456</li>
            <li>Company Admin 1: <b>admin1</b> / 123456</li>
            <li>Company Admin 2: <b>admin2</b> / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
