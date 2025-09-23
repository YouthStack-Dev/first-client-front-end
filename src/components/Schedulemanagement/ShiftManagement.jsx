import React, { useState } from "react";
import Modal from "../modals/Modal";
import ToolBar from "../ui/ToolBar";
import { Plus, Edit, Trash2, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import ShiftForm from "./ShiftForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import  { useSelector } from "react-redux";
import { selectAllShiftCategories, selectAllShifts } from "../../redux/features/shift/shiftSlice";
const ShiftManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [shiftToToggle, setShiftToToggle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const shifts = useSelector(selectAllShifts);
  const shiftCategories = useSelector(selectAllShiftCategories);
  const categories = useSelector((state)=> state.shift.shiftCategories.byId);



  const [shift, setShifts] = useState([]);



  
  const handleAddClick = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleDelete = (shift) => {
    setShiftToDelete(shift);
    setIsDeleteModalOpen(true);
  };

  const handleStatusToggle = (shift) => {
    setShiftToToggle(shift);
    setIsStatusModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingShift) {
      // Update existing shift
      setShifts(prev => prev.map(shift => 
        shift.id === editingShift.id 
          ? { 
              ...shift, 
              ...data,
              shiftCategory: shiftCategories.find(cat => cat.id === data.shiftCategoryId)
            }
          : shift
      ));
    } else {
      // Add new shift
      const newShift = {
        id: Math.max(...shifts.map(s => s.id)) + 1,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId: 3,
        isActive: true,
        shiftCategory: shiftCategories.find(cat => cat.id === data.shiftCategoryId)
      };
      setShifts(prev => [...prev, newShift]);
    }
    setIsModalOpen(false);
    setEditingShift(null);
  };

  const handleDeleteConfirm = () => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftToDelete.id));
    setIsDeleteModalOpen(false);
    setShiftToDelete(null);
  };

  const handleStatusConfirm = () => {
    setShifts(prev => prev.map(shift => 
      shift.id === shiftToToggle.id 
        ? { ...shift, isActive: !shift.isActive }
        : shift
    ));
    setIsStatusModalOpen(false);
    setShiftToToggle(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatTime = (hour, minute) => {
    const h = hour?.toString()?.padStart(2, '0');
    const m = minute?.toString()?.padStart(2, '0');
    return `${h}:${m}`;
  };

  // Filter shifts based on search term
  const filteredShifts = shifts.filter(shift =>
    shift?.shiftType?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    shift?.shiftCategory?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    formatTime(shift.hour, shift.minute).includes(searchTerm)
  );

  return (
    <div className="p-4 space-y-4">
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel="Add Shift"
        addButtonIcon={<Plus size={16} />}
        className="p-4 bg-white border rounded shadow-sm"
        searchBar={
          <input
            type="text"
            placeholder="Search shifts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        }
      />

      {/* Shifts Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No shifts found matching your search.' : 'No shifts available.'}
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shift.shiftType === "LOGIN" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shift.shiftType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(shift.hour, shift.minute)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {categories[ shift.shiftCategoryId].name|| 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(shift)}
                        className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 transition-colors"
                        title={shift.isActive ? "Deactivate shift" : "Activate shift"}
                      >
                        {shift.isActive ? (
                          <ToggleRight size={20} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-red-600" />
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          shift.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {shift.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(shift)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShift(null);
        }}
        title={editingShift ? 'Edit Shift' : 'Add Shift'}
        size="lg"
      >
        <ShiftForm
          initialData={editingShift || { shiftType: "", hour: "", minute: "", shiftCategoryId: "" }}
          categories={shiftCategories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingShift(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={isDeleteModalOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${shiftToDelete?.shiftType} shift at ${shiftToDelete ? formatTime(shiftToDelete.hour, shiftToDelete.minute) : ''}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setShiftToDelete(null);
        }}
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        show={isStatusModalOpen}
        title={`Confirm ${shiftToToggle?.isActive ? 'Deactivation' : 'Activation'}`}
        message={`Are you sure you want to ${shiftToToggle?.isActive ? 'deactivate' : 'activate'} this ${shiftToToggle?.shiftType} shift at ${shiftToToggle ? formatTime(shiftToToggle.hour, shiftToToggle.minute) : ''}?`}
        onConfirm={handleStatusConfirm}
        onCancel={() => {
          setIsStatusModalOpen(false);
          setShiftToToggle(null);
        }}
        confirmText={shiftToToggle?.isActive ? 'Deactivate' : 'Activate'}
        confirmVariant={shiftToToggle?.isActive ? 'danger' : 'success'}
      />
    </div>
  );
};

export default ShiftManagement;