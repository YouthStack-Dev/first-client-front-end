import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DriverToolbar from '../components/driver/DriverToolbar';
import DriverForm from '../components/driver/DriverForm';
import { driversData as initialData, DriverTableHeaders } from '../staticData/DriverData';

const DriverList = ({ drivers, onEdit, onDelete }) => {
  const hiddenColumns = new Set(['documentsUploaded']);
  const visibleHeaders = DriverTableHeaders.filter(
    (header) => !hiddenColumns.has(header.key)
  );

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-left text-gray-600">
              {visibleHeaders.map((header) => (
                <th key={header.key} className="px-4 py-3 whitespace-nowrap">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={visibleHeaders.length} className="p-4 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  {visibleHeaders.map((header) => (
                    <td key={header.key} className="px-4 py-3 text-sm">
                      {header.key === 'actions' ? (
                        <div className="flex gap-2 justify-center">
                          <button className="p-1 hover:bg-gray-100 rounded-full" onClick={() => onEdit(driver)}>
                            <Edit size={16} color="blue" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full" onClick={() => onDelete(driver.id)}>
                            <Trash2 size={16} color="red" />
                          </button>
                        </div>
                      ) : (
                        driver[header.key] || '—'
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function ManageDrivers() {
  const [driverList, setDriverList] = useState(initialData);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const vendors = [
    { id: 1, type: 'Vendor A' },
    { id: 2, type: 'Vendor B' },
    { id: 3, type: 'Vendor C' },
  ];

  const handleFilterChange = ({ driverStatus, vendorType }) => {
    console.log('Filters:', driverStatus, vendorType);
  };

  const handleBulkUpload = () => {
    alert('Bulk Upload clicked');
  };

  const handleManageCompliance = () => {
    alert('Manage Compliance clicked');
  };

  const handleEditDriver = (driver) => {
    setEditData(driver);
    setShowModal(true);
  };

  const handleAddDriver = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleDeleteDriver = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this driver?");
    if (confirmDelete) {
      setDriverList(prev => prev.filter(driver => driver.id !== id));
    }
  };

  const handleModalSubmit = (formData) => {
    if (editData) {
      // Edit Mode
      setDriverList(prev =>
        prev.map((d) => (d.id === formData.id ? formData : d))
      );
    } else {
      // Add Mode
      const newId = Math.max(...driverList.map(d => d.id)) + 1;
      setDriverList(prev => [...prev, { ...formData, id: newId }]);
    }

    setShowModal(false);
    setEditData(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditData(null);
  };

  return (
    <>
      <DriverToolbar
        vendors={vendors}
        onFilterChange={handleFilterChange}
        onBulkUpload={handleBulkUpload}
        onManageCompliance={handleManageCompliance}
        onAddDriver={handleAddDriver}
      />

      <DriverList
        drivers={driverList}
        onEdit={handleEditDriver}
        onDelete={handleDeleteDriver}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4">
            <DriverForm
              initialData={editData}
              isEdit={!!editData}
              onSubmit={handleModalSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(ManageDrivers);
