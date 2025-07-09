import React, { useState } from "react";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";

const ShiftCategoryManagement = () => {
  const [bookingCutOffEmployee, setBookingCutOffEmployee] = useState(0);
  const [cancellationCutOffEmployee, setCancellationCutOffEmployee] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "booking" or "cancellation"
  const [newCutoff, setNewCutoff] = useState("");

  const handleOpenModal = (type) => {
    setModalType(type);
    setNewCutoff(type === "booking" ? bookingCutOffEmployee.toString() : cancellationCutOffEmployee.toString());
    setIsModalOpen(true);
  };

  const handleUpdateCutoff = (e) => {
    e.preventDefault();
    const cutoffValue = parseFloat(newCutoff);
    if (isNaN(cutoffValue) || cutoffValue < 0) {
      return;
    }
    if (modalType === "booking" && cutoffValue > cancellationCutOffEmployee) {
      return;
    }
    if (modalType === "cancellation" && cutoffValue < bookingCutOffEmployee) {
      return;
    }
    if (modalType === "booking") {
      setBookingCutOffEmployee(cutoffValue);
    } else {
      setCancellationCutOffEmployee(cutoffValue);
    }
    setNewCutoff("");
    setIsModalOpen(false);
    setModalType(null);
  };

  const CutoffModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Set {modalType === "booking" ? "Booking" : "Cancellation"} Cutoff
        </h2>
        <form onSubmit={handleUpdateCutoff}>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {modalType === "booking" ? "Booking" : "Cancellation"} Cutoff (hours)
            </label>
            <input
              type="number"
              value={newCutoff}
              onChange={(e) => setNewCutoff(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              placeholder="e.g., 3"
              min="0"
              step="0.5"
              aria-label={`${modalType === "booking" ? "Booking" : "Cancellation"} cutoff hours`}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-400 text-white px-2 py-1 text-sm rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-2 py-1 text-sm rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 w-full">
      <HeaderWithActionNoRoute title="Cutoff Management" extraButtons={[]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-blue-600 font-semibold mb-2">Booking Cutoff</h3>
          <div className="space-y-2">
            <p className="text-sm">
              Booking Cutoff:{" "}
              <span className="font-bold text-lg text-blue-600">{bookingCutOffEmployee}</span> hours
            </p>
            <button
              onClick={() => handleOpenModal("booking")}
              className="bg-blue-600 text-white px-2 py-1 text-sm rounded-lg hover:bg-blue-700"
            >
              Set Booking Cutoff
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-blue-600 font-semibold mb-2">Cancellation Cutoff</h3>
          <div className="space-y-2">
            <p className="text-sm">
              Cancellation Cutoff:{" "}
              <span className="font-bold text-lg text-blue-600">{cancellationCutOffEmployee}</span> hours
            </p>
            <button
              onClick={() => handleOpenModal("cancellation")}
              className="bg-blue-600 text-white px-2 py-1 text-sm rounded-lg hover:bg-blue-700"
            >
              Set Cancellation Cutoff
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <CutoffModal />}
    </div>
  );
};

export default ShiftCategoryManagement;
