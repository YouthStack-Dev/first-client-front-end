import React, { useState } from "react";

const TABS = ["BASIC INFO", "CONTRACTS", "DRIVER"];

const initialState = {
  vendor: "",
  vehicleId: "",
  registrationNo: "",
  simNumber: "",
  deviceImei: "",
  vehicleType: "",
  contract: "",
  changeContractFrom: "",
  startHour: "00",
  startMinute: "00",
  workingTime: "1440",
  auditSmsTo: "Driver",
  driver: "",
  driverMobile: "",
  alternateMobile: "",
  garageName: "",
  garageGeocode: "",
  details: "",
};

const VehicleForm = ({ onSuccess, defaultValues = {} }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...defaultValues });

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const index = TABS.indexOf(activeTab);
    if (index < TABS.length - 1) setActiveTab(TABS[index + 1]);
  };

  const handleBack = () => {
    const index = TABS.indexOf(activeTab);
    if (index > 0) setActiveTab(TABS[index - 1]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
    onSuccess?.();
  };

  const renderField = (label, field, type = "text", placeholder = "", isRequired = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {isRequired && "*"}
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={handleChange(field)}
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );

  const renderSelect = (label, field, options, isRequired = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {isRequired && "*"}
      </label>
      <select
        value={formData[field]}
        onChange={handleChange(field)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium ${
              activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Unified Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {activeTab === "BASIC INFO" && (
          <>
            {renderSelect("Vendor", "vendor", ["Vendor 1", "Vendor 2"], true)}
            {renderField("Vehicle ID", "vehicleId", "text", "Enter Vehicle ID", true)}
            {renderField("Registration no.", "registrationNo", "text", "KA-01-AB-0123", true)}
            {renderField("Status", "status", "text")}
            {renderField("SIM number", "simNumber")}
            {renderSelect("Device IMEI number", "deviceImei", ["IMEI123", "IMEI456"])}
            <div className="col-span-2 flex justify-end">
              <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
                Next
              </button>
            </div>
          </>
        )}

        {activeTab === "CONTRACTS" && (
          <>
            {renderSelect("Vehicle Type", "vehicleType", ["SUV", "Sedan"], true)}
            {renderSelect("Change Contract From", "changeContractFrom", ["Start of day"], true)}
            {renderField("Contract", "contract", "text", "NA", true)}
            <div>
              <label className="block font-medium mb-1">Start Time</label>
              <div className="flex space-x-2">
                <select
                  value={formData.startHour}
                  onChange={handleChange("startHour")}
                  className="w-1/2 border px-3 py-2 rounded"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
                <select
                  value={formData.startMinute}
                  onChange={handleChange("startMinute")}
                  className="w-1/2 border px-3 py-2 rounded"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            {renderField("Working Time (min)", "workingTime", "number")}
            <div>
              <label className="block font-medium mb-1">Send Audit SMS</label>
              <div className="flex space-x-4">
                {["Driver", "Other"].map((opt) => (
                  <label key={opt} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="auditSmsTo"
                      value={opt}
                      checked={formData.auditSmsTo === opt}
                      onChange={handleChange("auditSmsTo")}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex justify-between">
              <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
                Back
              </button>
              <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
                Next
              </button>
            </div>
          </>
        )}

        {activeTab === "DRIVER" && (
          <>
            {renderSelect("Driver", "driver", ["Driver 1", "Driver 2"], true)}
            {renderField("Garage name", "garageName", "text", "Enter Garage name", true)}
            {renderField("Mobile no.", "driverMobile", "text", "Enter Mobile no.")}
            {renderField("Garage geocode", "garageGeocode", "text", "17.328026,78.274069", true)}
            {renderField("Alternate Mobile no.", "alternateMobile", "text", "Enter Alternate Mobile no.")}
            {renderField("Details", "details", "text", "Enter Details")}
            <div className="col-span-2 flex justify-between">
              <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
                Back
              </button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
                Add
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default VehicleForm;
