import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useLoginMutation } from "../redux/rtkquery/authApi";
import { LocalClient } from "../Api/API_Client";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await login({ username: "admin1", password: "pass123" }).unwrap();
      console.log("✅ Logged in", res);
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   try {
  //     const res = await LocalClient.post("login",{ username: "admin1", password: "pass123" })
  //     console.log("✅ Logged in", res);
  //   } catch (err) {
  //     console.error("❌ Login failed:", err);
  //   }
  // };
  
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Fleet Management Login</h1>

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
