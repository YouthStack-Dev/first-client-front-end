import axios from "axios";
import { useState } from "react";
import { API_CLIENT } from "../Api/API_Client";

const Practice = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      // Example backend API call
      const res = await API_CLIENT.get("/ss",)

      if (!res.status===200) throw new Error("Failed to fetch");

      const result = res
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Practice Page</h1>
      <p className="text-lg text-gray-700 mb-4">
        This is the practice page content.
      </p>

      <button
        onClick={handleClick}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Make Backend Request
      </button>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {data && (
        <pre className="mt-4 p-4 bg-white rounded shadow text-left">
        {data.data || JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Practice;
