import { createContext, useEffect, useState } from 'react';
import { API_CLIENT } from '../Api/API_Client'; // Adjust path as needed
import { log } from '../utils/logger';

export const ModulePermissionContext = createContext();

export const ModulePermissionProvider = ({ children }) => {
  const [modulePermissions, setModulePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    try {
      const response = await API_CLIENT.get('/auth/me');
      log("Fetched /auth/me response:", response);

      if (response.data?.user?.permissions) {
        setModulePermissions(response.data.user.permissions);
        log("Permissions set from /auth/me:", response.data.user.permissions);
      } else {
        log("No permissions found in response.");
        setModulePermissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); // or the actual key you use for the auth token
    if (token) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <ModulePermissionContext.Provider
      value={{
        modulePermissions,
        loading,
        error,
        setModulePermissions,
      }}
    >
      {children}
    </ModulePermissionContext.Provider>
  );
};
