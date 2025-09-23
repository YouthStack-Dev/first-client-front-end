import React, { useState, useEffect } from "react";
import FormField from "../ui/FormFields";
import Modal from "../modals/Modal";
import { validateVendorForm } from "./validators";

const VendorForm = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        contactPerson: initialData.contact_person || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateVendorForm(form);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Package the data for parent component
    const formData = {
      name: form.name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      contact_person: form.contactPerson.trim(),
      phone: form.phone.trim(),
      isActive: form.isActive,
    };

    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Vendor" : "Add Vendor"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Vendor Name" required error={errors.name}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
        </FormField>

        <FormField label="Email" required error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
        </FormField>

        <FormField label="Phone" error={errors.phone}>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
        </FormField>

        <FormField 
  label="Address" 
  name="address"
>
  <input
    name="address"
    value={form.address}
    onChange={handleChange}
    className="w-full mt-1 border px-2 py-1.5 rounded text-sm"
  />
</FormField>

<FormField 
  label="Point of Contact" 
  name="pointOfContact" 
  error={errors.pointOfContact}
>
  <input
    name="pointOfContact"
    value={form.pointOfContact}
    onChange={handleChange}
    className="w-full mt-1 border px-2 py-1.5 rounded text-sm"
  />
</FormField>
<div className="flex items-center space-x-2 mb-3">
  <input
    type="checkbox"
    name="isActive"
    checked={form.isActive}
    onChange={handleChange}
    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
  />
  <label className="text-xs font-medium">Vendor is Active</label>
</div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VendorForm;