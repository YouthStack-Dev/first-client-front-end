import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useLoginMutation } from "../redux/rtkquery/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { mockAuthPayload } from "../staticData/mockAuthPayload";
import { log } from "../utils/logger";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [{ isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { setModulePermissions } = useContext(ModulePermissionContext);

  const currentUser = mockAuthPayload.users.find(
    (u) => u.user.username === "admin1"
  );

  // 🔐 Static Login Function (with mock username/password check)
  const handleStaticLogin = async (username, password, dispatch, setError) => {
    try {
      const userMatch = mockAuthPayload.users.find(
        (u) => u.user.username === username
      );

      // Simple password check (hardcoded for all)
      if (!userMatch || password !== "123456") {
        throw new Error("Invalid username or password");
      }

      const token = userMatch.token;
      const decoded = jwtDecode(token);
      console.log("🔓 Decoded Token:", decoded);

      const expirationTime = decoded.exp * 1000;

      Cookies.set("auth_token", token, {
        expires: new Date(expirationTime),
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      dispatch(setUser(decoded));
      const email = decoded?.email?.toLowerCase();
      const permissions = userMatch?.allowedModules || [];

      setModulePermissions(permissions);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Static login failed:", err);
      setError("Invalid credentials");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    handleStaticLogin(credentials.username, credentials.password, dispatch, setError);

    // 🔄 API-based Login Flow (commented for now - fallback for production usage)
    // try {
    //   const res = await login().unwrap(); // ✅ using real input
    //   console.log("Login response", res);
    //   const token = res.token;
    //   if (!token) {
    //     throw new Error("No token found in response");
    //   }
    //   const decoded = jwtDecode(token);
    //   const expirationTime = decoded.exp * 1000;
    //   console.log(" this is decoded exp ", expirationTime);
    //   Cookies.set("auth_token", token, {
    //     expires: expirationTime,
    //     secure:  process.env.NODE_ENV === "production",// ❗ Set to false on localhost
    //     sameSite: "Strict",
    //   });
    //   dispatch(setUser(decoded));
    //   console.log("Token from cookie:", Cookies.get("auth_token")); // ✅ Must come after set
    //   // console.log("✅ Token set in cookies");
    //   navigate("/dashboard"); // or wherever you want to redirect
    // } catch (err) {
    //   if (err.data==="Network Error") {
    //   return  setError("Server not Conected");
    //   }
    //   console.error("❌ Login failed:", err);
    //   setError("Invalid username or password");
    // }
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
            <li>Client Admin 1: <b>clientadmin1</b> / 123456</li>
            <li>Client Admin 2: <b>clientadmin2</b> / 123456</li>
            <li>Company Admin 1: <b>admin1</b> / 123456</li>
            <li>Company Admin 2: <b>admin2</b> / 123456</li>
            <li>Vendor 1: <b>vendor1</b> / 123456</li>
            <li>Vendor 2: <b>vendor2</b> / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
