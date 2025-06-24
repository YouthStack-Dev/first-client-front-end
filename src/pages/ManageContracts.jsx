import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const initialContracts = [
  { id: 1, name: 'StandBy', vehicleType: 'StandBy', status: 'active' },
  { id: 2, name: 'SEDAN', vehicleType: 'SEDAN', status: 'active' },
  { id: 3, name: 'SEDAN_WOMENS', vehicleType: 'SEDAN', status: 'active' },
  { id: 4, name: 'OldContract', vehicleType: 'SUV', status: 'inactive' },
];

const ContractTable = ({ contracts }) => {
  return (
    <div className="mt-4 rounded border bg-white shadow">
      <table className="w-full text-sm table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">S No.</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Vehicle Type</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No contracts found.
              </td>
            </tr>
          ) : (
            contracts.map((contract, index) => (
              <tr key={contract.id} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{contract.name}</td>
                <td className="px-4 py-2">{contract.vehicleType}</td>
                <td className="px-4 py-2 text-center space-x-3 text-blue-600">
                  {contract.status === 'inactive' ? (
                    <button className="hover:underline">View</button>
                  ) : (
                    <>
                      <button className="hover:underline">Edit</button>
                      <button className="hover:underline">Disable</button>
                      <button className="hover:underline">Edit Issues</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const ManageContracts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [contracts] = useState(initialContracts);
  const navigate = useNavigate();

  const filteredContracts = contracts.filter((c) => c.status === activeTab);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-xl font-semibold text-center mb-4">Contract</h2>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Bulk Upload Contracts
        </button>
        <button
          onClick={() => navigate('/contract/create-contract')}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Add New Contract
        </button>
      </div>

      {/* Tabs for Active/Inactive */}
      <div className="mt-6 border-b border-gray-300 flex gap-4">
        {['active', 'inactive'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-6 py-2 -mb-px border-b-2 font-medium ${
              activeTab === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
          >
            {status === 'active' ? 'Active Contracts' : 'Inactive Contracts'}
          </button>
        ))}
      </div>

      {/* Table */}
      <ContractTable contracts={filteredContracts} />
    </div>
  );
};

export default ManageContracts;
