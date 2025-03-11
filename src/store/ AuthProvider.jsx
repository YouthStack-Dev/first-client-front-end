// // authContext.jsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import {jwtDecode} from 'jwt-decode'; // Ensure you install this library for decoding JWTs
// import { axiosClient } from '../Api/API_Client';
// import { LOGIN } from '../Api/Endpoints';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [isAuthenticated, setAuthenticated] = useState(false);

//     // Check for token in cookies on app load
//     useEffect(() => {
//         const token = Cookies.get('authtoken'); // Retrieve the token from cookies
//         if (token) {
//             try {
//                 const decodedToken = jwtDecode(token); // Decode the token
//                 setAuthenticated(true); // Set authentication to true
//             } catch (error) {
//                 console.error('Invalid token:', error);
//                 Cookies.remove('authtoken'); // Clear invalid token
//                 setAuthenticated(false);
//             }
//         }
//     }, []);

//     // Login function
//     const login = async (username, password) => {
//         try {
//             const response = await axiosClient.post(LOGIN, { email: username, password: password });
//             if (response.status === 200) {
//                 const jwtToken = response.data.token;

//                 const expirationTime = new Date();
//                 expirationTime.setMinutes(expirationTime.getMinutes() + 3); // Add 3 minutes to the current time
                
//                 Cookies.set('authtoken', jwtToken, {
//                   expires: expirationTime,  // Passing the Date object directly
//                   secure: true,
//                   sameSite: 'Strict'
//                 });
//                 setUser({role:"admin"}); // Set user details from the decoded token
                
                  

//                 // Decode the token to extract user details
//                 const decodedToken = jwtDecode(jwtToken);

//                 // Update state
//                 // setUser(decodedToken);
//                 setAuthenticated(true);

//                 return true;
//             }
//         } catch (error) {
//             console.error('Login failed:', error);
//             return false;
//         }
//     };

//     // Logout function
//     const logout = () => {
//         setUser(null);
//         setAuthenticated(false);
//         Cookies.remove('authtoken'); // Clear the token from cookies
//     };

//     return (
//         <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);



import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LocalClient } from '../Api/API_Client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);  // ✅ Add loading state
 
  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedRole = localStorage.getItem('userRole');  // Use localStorage here
        if (storedRole) {
          setIsAuthenticated(true);
          setUserRole(storedRole);
        }
      } catch (error) {
        console.log('Error checking authentication status', error);
      } finally {
        setLoading(false); // ✅ Set loading to false after checking auth
      }
    };
    checkAuth();
  }, []);

  // Frontend: login.js
  const login = async (email, password) => {
    try {
      console.log("login method got invoked");
      
      // Make the login request using Axios
      const response = await LocalClient.post("login", { email, password });

      console.log("this is the req ", { email, password });
      console.log("this is the response ", response.data);

      if (response.data.success) {
        const { role, message } = response.data;
        localStorage.setItem('userRole', role);  // Save role in localStorage
        setIsAuthenticated(true);
        setUserRole(role);
        alert(message);  // Show success message
          
      } else {
        alert('Login failed: ' + response.data.message); // Show failure message
      }
    } catch (error) {
      // Check if the error is an AxiosError and handle accordingly
      if (error.response) {
        // Server responded with a status code outside of the 2xx range
        if (error.response.status === 404) {
          alert('User not found. Please check your credentials.');
        } else if (error.response.status === 401) {
          alert('Incorrect password. Please try again.');
        } else {
          alert('Login failed: ' + error.response.data.message);
        }
      } else if (error.request) {
        // No response was received from the server
        alert('No response from the server. Please check your network connection.');
      } else {
        // Something else caused the error
        alert('An error occurred while logging in.');
      }
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');  // Remove userRole from localStorage
      setIsAuthenticated(false);
      setUserRole(null);
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, loading, setIsAuthenticated, setUserRole, logout,login }}>
      {children}
    </AuthContext.Provider>
  );    
};
