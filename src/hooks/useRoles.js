// hooks/useRoles.js
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchRolesThunk } from "../redux/features/Permissions/permissionsThunk";

export const useRoles = (shouldFetch = false) => {
  const dispatch = useDispatch();

  const {
    roles = [],
    rolesLoading,
    rolesLoaded,
    rolesError,
    fetchedRoles,
  } = useSelector((state) => state.permissions || {});

  // Fetch roles when shouldFetch is true
  useEffect(() => {
    if (shouldFetch && !fetchedRoles && !rolesLoading) {
      dispatch(fetchRolesThunk());
    }
  }, [shouldFetch, fetchedRoles, rolesLoading, dispatch]);

  // Return formatted roles for dropdown/select components
  const roleOptions = roles.map((role) => ({
    value: role.id || role.role_id,
    label: role.name || role.display_name,
    ...role, // Include all role properties
  }));

  return {
    roles,
    roleOptions,
    loading: rolesLoading,
    loaded: rolesLoaded,
    error: rolesError,
    fetched: fetchedRoles,
  };
};

// Alternative: Simple hook that only returns formatted options
export const useRoleOptions = (shouldFetch = false) => {
  const { roles, loading, loaded, error, fetched } = useRoles(shouldFetch);

  const roleOptions = roles.map((role) => ({
    value: role.id || role.role_id,
    label: role.name || role.display_name,
    ...role,
  }));

  return {
    options: roleOptions,
    loading,
    loaded,
    error,
    fetched,
  };
};
