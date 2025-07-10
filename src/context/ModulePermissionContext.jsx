import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { FirstClientpermissions, staticPermissions } from '../staticData/ModulePermissions';
import { log } from '../utils/logger';

export const ModulePermissionContext = createContext();

export const ModulePermissionProvider = ({ children }) => {
  const [modulePermissions, setModulePermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Run after 3 seconds delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkAuthAndSetPermissions();
    }, 1000); // 3 seconds

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);

  const checkAuthAndSetPermissions = () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        setModulePermissions([]);
        log(" didnt find the token");
        return;
      }

      // const decoded = jwtDecode(token);
      // const email = decoded?.email?.toLowerCase();

      // if (!email) {
      //   setModulePermissions([]);
      //   return;
      // }

      // log("This is the email in context:", email);
      // const userPermissions = staticPermissions[email];
      // log("User permissions from Context:", userPermissions);

      setModulePermissions(FirstClientpermissions);
    } catch (err) {
      console.error('Error decoding token or loading permissions:', err);
      setModulePermissions([]);
    } finally {
      setLoading(false); // Done after permissions are set
    }
  };

  return (
    <ModulePermissionContext.Provider value={{ modulePermissions, loading, setModulePermissions }}>
      {children}
    </ModulePermissionContext.Provider>
  );
};
