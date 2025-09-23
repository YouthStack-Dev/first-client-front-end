import { useMemo } from "react";

export default function usePermission(moduleId) {
    // Load and cache permissions only once per render cycle
    const allowedModules = useMemo(() => {
        const data = JSON.parse(sessionStorage.getItem("userPermissions")) || {};
        return data.allowedModules || [];
    }, []);

    // Recursive search
    function findInArray(arr, id) {
        for (const item of arr) {
            if (item.id === id) return item;
            if (item.children?.length) {
                const found = findInArray(item.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    // Get full permission object for a module
    function getPermissionById(id) {
        return findInArray(allowedModules, id);
    }

    // Direct true/false for a specific action
    function hasPermission(id, action) {
        const perm = getPermissionById(id);
        return perm ? Boolean(perm[action]) : false;
    }

    // If moduleId is passed, expose its permissions as variables
    const modulePermissions = moduleId ? getPermissionById(moduleId) : null;
    const canRead = modulePermissions?.canRead ?? false;
    const canWrite = modulePermissions?.canWrite ?? false;
    const canDelete = modulePermissions?.canDelete ?? false;

    return {
        canRead,
        canWrite,
        canDelete,
        getPermissionById,
        hasPermission
    };
}
