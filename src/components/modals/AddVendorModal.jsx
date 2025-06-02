import React, { useState } from "react";
import Modal from "./Modal";

const AddVendorModal = ({ isOpen, onClose, }) => {
  const [form, setForm] = useState({
    vendorId: "",
    name: "",
    pickupDropPoint: "",
    pointOfContact: "",
    phoneNumber: "",
    email: "",
    comments: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!form.vendorId) newErrors.vendorId = "Vendor ID is required";
    if (!form.name) newErrors.name = "Vendor Name is required";
    if (!form.pointOfContact) newErrors.pointOfContact = "Point of Contact is required";
    if (!form.email) newErrors.email = "Email is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onClose();
      setForm({
        vendorId: "",
        name: "",
        pickupDropPoint: "",
        pointOfContact: "",
        phoneNumber: "",
        email: "",
        comments: "",
      }); 
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vendor" size="md">
      <div >
        <div>
          <label className="block font-medium">Vendor ID *</label>
          <input
            name="vendorId"
            value={form.vendorId}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.vendorId && <p className="text-sm text-red-500">{errors.vendorId}</p>}
        </div>

        <div>
          <label className="block font-medium">Vendor Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-medium">Pickup/Drop Point</label>
          <input
            name="pickupDropPoint"
            value={form.pickupDropPoint}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Point of Contact *</label>
          <input
            name="pointOfContact"
            value={form.pointOfContact}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
          {errors.pointOfContact && <p className="text-sm text-red-500">{errors.pointOfContact}</p>}
        </div>

        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
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
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block font-medium">Comments</label>
          <textarea
            name="comments"
            value={form.comments}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded"
          />
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
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVendorModal;
