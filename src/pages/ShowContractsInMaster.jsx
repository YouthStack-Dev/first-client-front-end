import React, { useState } from "react";
import { Edit, Trash2, Clock, Upload, Download } from "lucide-react";
import { vehicleContractDummyData } from "../staticData/Contractdata";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";

const ShowContractsInMaster = () => {
  const [filters, setFilters] = useState({
    name: "",
    cabType: "",
    shortCode: "",
    contractType: "",
  });
  const [showInactive, setShowInactive] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = vehicleContractDummyData.filter((item) => {
    return (
      item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      item.cabType.toLowerCase().includes(filters.cabType.toLowerCase()) &&
      item.shortCode.toLowerCase().includes(filters.shortCode.toLowerCase()) &&
      item.contractType.toLowerCase().includes(filters.contractType.toLowerCase()) &&
      (showInactive ? item.status === "inactive" : item.status !== "inactive")
    );
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen space-y-4">
      {/* Page Header */}
      <HeaderWithActionNoRoute title="Show Contracts" />

      {/* Filter Row */}
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="px-2 py-1 border rounded text-sm"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Cab Type"
            className="px-2 py-1 border rounded text-sm"
            value={filters.cabType}
            onChange={(e) => handleFilterChange("cabType", e.target.value)}
          />
          <input
            type="text"
            placeholder="Short Code"
            className="px-2 py-1 border rounded text-sm"
            value={filters.shortCode}
            onChange={(e) => handleFilterChange("shortCode", e.target.value)}
          />
          <input
            type="text"
            placeholder="Contract Type"
            className="px-2 py-1 border rounded text-sm"
            value={filters.contractType}
            onChange={(e) => handleFilterChange("contractType", e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            Show Inactive Contracts
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
              className="toggle-checkbox"
            />
          </label>

          <button className="p-2 hover:bg-gray-100 rounded" title="Download">
            <Download size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Upload">
            <Upload size={18} />
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Sr No</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Cab Type</th>
              <th className="px-3 py-2 text-left">Short Code</th>
              <th className="px-3 py-2 text-left">Contract Type</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No contracts found.
                </td>
              </tr>
            ) : (
              filteredData.map((contract, index) => (
                <tr
                  key={contract.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{contract.name}</td>
                  <td className="px-3 py-2">{contract.cabType}</td>
                  <td className="px-3 py-2">{contract.shortCode}</td>
                  <td className="px-3 py-2">{contract.contractType}</td>
                  <td className="px-3 py-2 text-center space-x-2 text-blue-600">
                    <button className="hover:bg-gray-100 p-1 rounded" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="hover:bg-gray-100 p-1 rounded" title="Delete">
                      <Trash2 size={16} />
                    </button>
                    <button className="hover:bg-gray-100 p-1 rounded" title="History">
                      <Clock size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowContractsInMaster;
