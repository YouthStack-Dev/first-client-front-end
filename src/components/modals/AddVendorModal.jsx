import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const AddVendorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    vendor_name: "",
    address: "",
    contact_person: "",
    phone_number: "",
    email: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        vendor_name: initialData.vendor_name || "",
        address: initialData.address || "",
        contact_person: initialData.contact_person || "",
        phone_number: initialData.phone_number || "",
        email: initialData.email || ""
      });
    } else {
      setForm({
        vendor_name: "",
        address: "",
        contact_person: "",
        phone_number: "",
        email: ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.vendor_name) newErrors.vendor_name = "Vendor Name is required";
    if (!form.contact_person) newErrors.contact_person = "Point of Contact is required";
    if (!form.email) newErrors.email = "Email is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onSave(form);
      onClose();
      setForm({
        vendor_name: "",
        address: "",
        contact_person: "",
        phone_number: "",
        email: ""
      });
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vendor" size="md">
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Vendor Name *</label>
          <input
            name="vendor_name"
            value={form.vendor_name}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.vendor_name && (
            <p className="text-sm text-red-500">{errors.vendor_name}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Pickup/Drop Point</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Point of Contact *</label>
          <input
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.contact_person && (
            <p className="text-sm text-red-500">{errors.contact_person}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Email ID *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <p className="text-sm text-gray-500">* Please enter mandatory fields</p>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVendorModal;
