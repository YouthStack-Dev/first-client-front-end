import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
  deleteEscortThunk,
} from "../redux/features/escort/escortThunks";

import {
  escortSelectors,
  selectEscortLoading,
} from "../redux/features/escort/escortSlice";

import { genderOptions } from "../components/escort/constants";

import EscortTable from "../components/escort/EscortTable";
import EscortFormModal from "../components/modals/EscortFormModal";
import { DownloadCloud, Plus } from "lucide-react";
import { useVendorOptions } from "../hooks/useVendorOptions";

const EscortManagement = () => {
  const dispatch = useDispatch();

  const escorts = useSelector(escortSelectors.selectAll);
  const loading = useSelector(selectEscortLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEscort, setSelectedEscort] = useState(null);

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const vendors = useVendorOptions();
  function getInitialFormData() {
    return {
      vendor_id: null,
      name: "",
      phone: "",
      email: "",
      address: "",
      gender: "",
      is_active: true,
      is_available: true,
    };
  }

  useEffect(() => {
    dispatch(fetchEscortsThunk());
  }, [dispatch]);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedEscort(null);
    setFormData(getInitialFormData());
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (escort) => {
    setModalMode("edit");
    setSelectedEscort(escort);
    setFormData(escort);
    setIsModalOpen(true);
  };

  const handleView = (escort) => {
    setModalMode("view");
    setSelectedEscort(escort);
    setFormData(escort);
    setIsModalOpen(true);
  };

  const handleDelete = (escortId) => {
    if (window.confirm("Delete this escort?")) {
      dispatch(deleteEscortThunk(escortId));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.phone.trim()) newErrors.phone = "Phone required";

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (modalMode === "create") {
      dispatch(createEscortThunk(formData));
    } else {
      dispatch(
        updateEscortThunk({
          id: selectedEscort.escort_id,
          data: formData,
        })
      );
    }

    setIsModalOpen(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total Escorts: <span className="font-semibold">{escorts.length}</span>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Create Escort
        </button>
      </div>

      {/* Table */}
      <EscortTable
        escorts={escorts}
        vendors={vendors}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <EscortFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        formData={formData}
        errors={errors}
        vendors={vendors}
        genderOptions={genderOptions}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EscortManagement;
