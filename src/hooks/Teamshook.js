// src/hooks/Teamshook.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchTeamThunk } from "../redux/features/user/userTrunk";

export const useTeamOptions = ({ params = {}, shouldFetch = false } = {}) => {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shouldFetch) return;

    let isMounted = true;

    setLoading(true);
    setError(null);

    dispatch(fetchTeamThunk({ params }))
      .unwrap()
      .then((res) => {
        if (!isMounted) return;

        // Normalize response to array
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];

        setData(items);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to fetch teams");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shouldFetch, JSON.stringify(params), dispatch]);

  // Dropdown-ready options
  const options = data.map((team) => ({
    value: team.id || team.team_id,
    label: team.name || team.label || "",
    data: team,
  }));

  return {
    options,
    rawData: data,
    loading,
    error,
  };
};
