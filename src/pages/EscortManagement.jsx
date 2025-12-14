import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
  deleteEscortThunk,
  toggleEscortActiveThunk,
  toggleEscortAvailableThunk,
} from "../redux/features/escort/escortThunks";

import {
  escortSelectors,
  selectEscortLoading,
  selectEscortError,
} from "../redux/features/escort/escortSlice";

import { genderOptions } from "../components/escort/constants";

import EscortTable from "../components/escort/EscortTable";
import EscortFormModal from "../components/modals/EscortFormModal";
import { Plus } from "lucide-react";
import { useVendorOptions } from "../hooks/useVendorOptions";

const EscortManagement = () => {
  const dispatch = useDispatch();

  const escorts = useSelector(escortSelectors.selectAll);
  const loading = useSelector(selectEscortLoading);
  const serverError = useSelector(selectEscortError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEscort, setSelectedEscort] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [formErrors, setFormErrors] = useState({});
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (escort) => {
    setModalMode("edit");
    setSelectedEscort(escort);
    setFormData(escort);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleView = (escort) => {
    setModalMode("view");
    setSelectedEscort(escort);
    setFormData(escort);
    setIsModalOpen(true);
  };

  const handleDelete = async (escortId) => {
    if (!window.confirm("Delete this escort?")) return;

    try {
      // delete
      await dispatch(deleteEscortThunk(escortId)).unwrap();

      // refetch list after successful delete
      await dispatch(fetchEscortsThunk()).unwrap();
    } catch (err) {
      if (err?.errorCode === "ESCORT_NOT_FOUND") {
        alert("Escort already deleted or not found.");
      } else {
        alert(err?.message || "Failed to delete escort.");
      }

      // still refetch to sync UI
      dispatch(fetchEscortsThunk());
    }
  };

  const handleOnToggleActive = async (escort) => {
    try {
      await dispatch(
        toggleEscortActiveThunk({
          id: escort.escort_id,
          currentState: escort.is_active,
        })
      ).unwrap();

      // Refresh the list after successful toggle
      dispatch(fetchEscortsThunk());
    } catch (error) {
      console.error("Failed to toggle active status:", error);
      // You could show a toast notification here
      alert(
        `Failed to update active status: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleOnToggleAvailable = async (escort) => {
    try {
      await dispatch(
        toggleEscortAvailableThunk({
          id: escort.escort_id,
          currentState: escort.is_available,
        })
      ).unwrap();

      // Refresh the list after successful toggle
      dispatch(fetchEscortsThunk());
    } catch (error) {
      console.error("Failed to toggle available status:", error);
      // You could show a toast notification here
      alert(
        `Failed to update available status: ${error.message || "Unknown error"}`
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.phone.trim()) newErrors.phone = "Phone required";

    setFormErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;
      if (modalMode === "create") {
        result = await dispatch(createEscortThunk(formData)).unwrap();
      } else {
        result = await dispatch(
          updateEscortThunk({
            id: selectedEscort.escort_id,
            data: formData,
          })
        ).unwrap();
      }

      // If we get here, the thunk succeeded
      dispatch(fetchEscortsThunk());
      setIsModalOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
    setIsSubmitting(false);
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
        onToggleActive={handleOnToggleActive}
        onToggleAvailable={handleOnToggleAvailable}
      />

      {/* Modal */}
      <EscortFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        formData={formData}
        errors={{
          ...formErrors,
          server: serverError,
        }}
        vendors={vendors}
        genderOptions={genderOptions}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default EscortManagement;
