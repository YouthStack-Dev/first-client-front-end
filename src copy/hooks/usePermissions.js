// src/hooks/useModulePermissions.js
import { useState, useEffect, useMemo } from 'react';

export const useModulePermissions = (moduleName) => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load permissions from session storage
  useEffect(() => {
    const loadPermissions = () => {
      try {
        setIsLoading(true);
        const storedPermissions = sessionStorage.getItem('userPermissions');
        
        if (storedPermissions) {
          const parsedPermissions = JSON.parse(storedPermissions);
          setPermissions(parsedPermissions.permissions || []);
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userPermissions') {
        loadPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get permissions for the specified module
  const modulePermissions = useMemo(() => {
    if (!moduleName) return {};
    
    const module = permissions.find(p => p.module === moduleName);
    if (!module) return {};
    
    // Convert actions array to object with boolean values
    const actions = module.action || [];
    return actions.reduce((acc, action) => {
      acc[action] = true;
      return acc;
    }, {});
  }, [moduleName, permissions]);

  // Helper function to check specific permission
  const can = (action) => {
    return !!modulePermissions[action];
  };

  // Common CRUD permissions
  const canRead = can('read');
  const canCreate = can('create');
  const canUpdate = can('update');
  const canDelete = can('delete');

  return {
    isLoading,
    permissions: modulePermissions,
    can,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    hasAccess: canRead, // At least read access means they have module access
  };
};