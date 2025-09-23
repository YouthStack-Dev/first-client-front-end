import React, { useEffect, useState } from 'react';
import { Edit, MoreVertical, Plus, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { InputField, Modal } from '../components/SmallComponents';

// Memoized Staff List Component
const StaffList = React.memo(({ staffs, menuOpen, onNext, onPrev, currentPage, totalPages, isLoading }) => (
  <div className="rounded-lg overflow-hidden shadow-sm mt-2">
    <div className="overflow-auto h-[620px]">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 border-b sticky top-0">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3 w-1/3">Staff Name</th>
            <th className="px-4 py-3 w-1/3">Created At</th>
            <th className="px-4 py-3 w-1/3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                Loading staff...
              </td>
            </tr>
          ) : staffs?.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                No staff found
              </td>
            </tr>
          ) : (
            staffs.map((staff) => (
              <tr key={staff.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{staff.name}</td>
                <td className="px-4 py-3">{new Date(staff.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center relative">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                  {menuOpen === staff.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10">
                      <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                        <Edit size={18} color="blue" />
                        <span className="text-xs">Manage</span>
                      </button>
                      <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                        <Trash2 size={18} color="red" />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded transition 
          ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        <ChevronLeft size={18} />
        Prev
      </button>

      <span className="text-sm text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded transition 
          ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
));

function ManageStaffs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [staffModal, setStaffModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  // const { data :staffs=[], isLoading } = useGetClientsQuery(); 

  const staffs = [
    { id: 1, name: "John Doe", createdAt: "2025-05-01T10:30:00Z" },
    { id: 2, name: "Jane Smith", createdAt: "2025-05-03T14:15:00Z" },
    { id: 3, name: "Robert Johnson", createdAt: "2025-05-05T09:45:00Z" },
    { id: 4, name: "Emily Davis", createdAt: "2025-05-06T12:00:00Z" },
    { id: 5, name: "Michael Brown", createdAt: "2025-05-07T11:20:00Z" },
    { id: 6, name: "Linda Wilson", createdAt: "2025-05-08T15:10:00Z" },
    { id: 7, name: "William Jones", createdAt: "2025-05-09T08:50:00Z" },
    { id: 8, name: "Patricia Garcia", createdAt: "2025-05-10T13:30:00Z" },
    { id: 9, name: "David Martinez", createdAt: "2025-05-11T10:40:00Z" },
    { id: 10, name: "Jennifer Rodriguez", createdAt: "2025-05-12T16:00:00Z" },
    { id: 11, name: "Daniel Lee", createdAt: "2025-05-13T09:00:00Z" },
    { id: 12, name: "Susan Clark", createdAt: "2025-05-14T17:30:00Z" },
  ];
  
  const isLoading = false;
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil((staffs?.length || 0) / itemsPerPage);

  const onPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const staffName = formData.get("staffName");
    console.log({ staffName });
    // Add API call here
    setStaffModal(false);
  };

  const paginatedStaffs = staffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Manage Staffs</h1>
          <button
            onClick={() => setStaffModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Add staff"
          >
            <Plus size={20} />
            Add Staff
          </button>
        </div>

        {/* Add Staff Modal */}
        <Modal
          isOpen={staffModal}
          onClose={() => setStaffModal(false)}
          title="Add New Staff"
          onSubmit={handleStaffSubmit}
        >
          <InputField
            label="Staff Name"
            name="staffName"
            placeholder="Enter staff name"
            required
          />
        </Modal>

        {/* Staff List */}
        <StaffList
          staffs={paginatedStaffs}
          menuOpen={menuOpen}
          onNext={onNext}
          onPrev={onPrev}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

export default React.memo(ManageStaffs);
