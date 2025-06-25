import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const initialContracts = [
  { id: 1, name: 'StandBy', vehicleType: 'StandBy', status: 'active' },
  { id: 2, name: 'SEDAN', vehicleType: 'SEDAN', status: 'active' },
  { id: 3, name: 'SEDAN_WOMENS', vehicleType: 'SEDAN', status: 'active' },
  { id: 4, name: 'OldContract', vehicleType: 'SUV', status: 'inactive' },
];

const ContractTable = ({ contracts, onActionClick }) => {
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
                    <button onClick={() => onActionClick('view', contract)} className="hover:underline">View</button>
                  ) : (
                    <>
                      <button onClick={() => onActionClick('edit', contract)} className="hover:underline">Edit</button>
                      <button onClick={() => onActionClick('disable', contract)} className="hover:underline">Disable</button>
                      <button onClick={() => onActionClick('issues', contract)} className="hover:underline">Edit Issues</button>
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

const AllContracts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [contracts] = useState(initialContracts);
  const [selectedContract, setSelectedContract] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const filteredContracts = contracts.filter((c) => c.status === activeTab);

  const handleActionClick = (type, contract) => {
    setSelectedContract(contract);
    setActionType(type);
    setShowModal(true);
  };

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
      <ContractTable contracts={filteredContracts} onActionClick={handleActionClick} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4 capitalize">{actionType} Contract</h3>
            <p className="mb-4 text-sm text-gray-700">Contract: <strong>{selectedContract?.name}</strong></p>

            {/* Custom logic or forms can be inserted here */}
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log(`${actionType} confirmed for`, selectedContract);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllContracts;
