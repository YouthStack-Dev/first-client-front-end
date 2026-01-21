// CategoryForm.jsx
import React, { useState, useEffect } from "react";
import InputField from "../InputField";
import { Modal } from "../SmallComponents";
// import Modal from "../modals/Modal"; // Import the reusable Modal

const CategoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialData = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is edit mode
  const isEditMode = mode === "edit" || Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      } else {
        // Reset form for create mode
        setFormData({ name: "", description: "" });
      }
    }
  }, [isOpen, isEditMode, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      // Call the onSubmit function provided by parent
      if (onSubmit) {
        await onSubmit(formData);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose?.();

      // Reset form
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Prepare modal title
  const getModalTitle = () => {
    return isEditMode ? "Edit Shift Category" : "Add Shift Category";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={getModalTitle()}
      size="sm"
      mode={mode}
      isLoading={isLoading}
      submitText={isEditMode ? "Update" : "Save"}
      hideFooter={false}
    >
      <div className="space-y-4">
        <InputField
          label="Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter shift category name"
          required
          disabled={isLoading}
        />

        <InputField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter shift category description"
          required
          disabled={isLoading}
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default CategoryForm;
