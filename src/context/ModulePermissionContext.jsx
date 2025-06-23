// src/contexts/ModulePermissionContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { staticPermissions } from '../staticData/ModulePermissions';
export const ModulePermissionContext = createContext();


export const ModulePermissionProvider = ({ children }) => {
  const [modulePermissions, setModulePermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndSetPermissions = () => {
      try {
        const token = Cookies.get('auth_token');
        if (!token) {
          setModulePermissions([]);
          return;
        }
  
        const decoded = jwtDecode(token);
        const email = decoded?.email?.toLowerCase();
  
        if (!email) {
          setModulePermissions([]);
          return;
        }
  
        const userPermissions = staticPermissions[email];
        const allowedModules = userPermissions?.allowedModules ?? [];
  
        setModulePermissions(Array.isArray(allowedModules) ? allowedModules : []);
      } catch (err) {
        console.error('Error decoding token or loading permissions:', err);
        setModulePermissions([]);
      } finally {
        setLoading(false);
      }
    };
  
    checkAuthAndSetPermissions();
  }, []);

  return (
    <ModulePermissionContext.Provider value={{ modulePermissions, loading ,setModulePermissions }}>
      {children}
    </ModulePermissionContext.Provider>
  );
};