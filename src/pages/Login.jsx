import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { mockAuthPayload } from "../staticData/mockAuthPayload";
import { loginUser } from "../redux/slices/authSlice";
import { log ,error} from "../utils/logger";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setModulePermissions } = useContext(ModulePermissionContext);
  const currentUser = mockAuthPayload.users.find(
    (u) => u.user.username === "admin1"
  );
  const { loading:isLoading,error:err, user } = useSelector((state) => state.auth);


  // 🔐 Static Login Function (with mock username/password check)

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Call loginUser thunk
      const res = await dispatch(
        loginUser({ 
          username: credentials?.username, 
          password: credentials?.password 
        })
      ).unwrap();
  
     log("Login response data:", res);
  
      const token = res?.access_token;
      if (!token) {
        throw new Error("No token found in response");
      }
  
      // Store permissions (optional)
      const permissions = res?.permissions || [];
      setModulePermissions(permissions);
  
      // Decode token to get user info
      const decoded = jwtDecode(token);
      log("This is the decoded code ", decoded);
      // Calculate expiration time if needed
      // Example: if your token has exp in seconds
      const expirationTime = decoded?.exp 
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000); // fallback 1h
        
        log("This is  expire time ", expirationTime);
      // Set token in cookies
      Cookies.set("auth_token", token, {
        expires: expirationTime,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
  
      dispatch(setUser(decoded));
     log("Token from cookie:", Cookies.get("auth_token"));
  
      navigate("/dashboard");
    } catch (err) {
      if (err?.message === "Network Error") {
        error("🌐 Network error:", err);
      } else {
      error("❌ Login failed:", err);
      }
      // Optionally set error state here for UI feedback
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">MLT ETS Login</h2>

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
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
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
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
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
