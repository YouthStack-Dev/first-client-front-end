import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useLoginMutation } from "../redux/rtkquery/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { MOCK_TOKENS } from "../utils/auth";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { staticPermissions } from "../staticData/ModulePermissions";


const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useDispatch();
  
  const { setModulePermissions} = useContext(ModulePermissionContext);
  const handleStaticLogin = async (dispatch, setError, role = 'ADMIN') => {
    try {
      const mockToken =  MOCK_TOKENS.ADMIN; // fallback to ADMIN token

      if (!mockToken || typeof mockToken !== 'string') {
        throw new Error('Invalid mock token');
      }
  
      const decoded = jwtDecode(mockToken);
      
      const expirationTime = decoded.exp * 1000;
  
      Cookies.set("auth_token", mockToken, {
        expires: new Date(expirationTime),
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
  
      dispatch(setUser(decoded));
      console.log("Static login decoded:", decoded);
      console.log("Token from cookie:", Cookies.get("auth_token"));
      const email = decoded?.email?.toLowerCase();
      const permissions = staticPermissions[email] || [];
      setModulePermissions(permissions);
      navigate("/dashboard");
  
    } catch (err) {
      console.error("❌ Static login failed:", err);
      setError("Static login error");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    handleStaticLogin(dispatch, setError, navigate);

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6"> MLT ETS Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p className="text-center">Demo Accounts:</p>
          <ul className="mt-2 space-y-1">
            <li>Super Admin: superadmin / super123</li>
            <li>Admin: admin / admin123</li>
            <li>Vendor: vendor / vendor123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
