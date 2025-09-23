// src/components/PermissionLoader.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchModulesThunk } from "../redux/features/modules/moduleThunk";

const PermissionLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchModulesThunk());
  }, [dispatch]);

  return children;
};

export default PermissionLoader;
