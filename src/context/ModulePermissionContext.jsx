import { createContext,  useEffect, useState } from 'react';
import { FirstClientpermissions } from '../staticData/ModulePermissions';
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
      const token = localStorage.getItem('access_token');
      if (!token) {
        setModulePermissions([]);
        log("didn't find the token in localStorage");
        return;
      }

  
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
