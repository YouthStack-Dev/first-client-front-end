import React, { useState } from "react";

const TABS = ["BASIC INFO", "CONTRACTS", "DOCUMENTS", "DRIVER"];

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
  rcCopy: "",
  rcExpiryDate: "",
  insuranceCopy: "",
  insuranceExpiryDate: "",
  permitCopy: "",
  permitExpiryDate: "",
  pucCopy: "",
  pucExpiryDate: "",
  gstCertificate: "",
  gstExpiryDate: "",
  taxReceipt: "",
  taxExpiryDate: "",
};

const VehicleForm = ({ onSuccess, defaultValues = {} }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...defaultValues });

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, [field]: file }));
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
    onSuccess?.(formData);
  };

  const renderField = (label, field, type = "text", placeholder = "", isRequired = false) => (
    <div>
      <label className="block font-medium mb-1">{label}{isRequired && " *"}</label>
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
      <label className="block font-medium mb-1">{label}{isRequired && " *"}</label>
      <select
        value={formData[field]}
        onChange={handleChange(field)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const renderFileWithExpiry = (label, fileField, expiryField) => (
    <div className="col-span-1 space-y-2">
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type="file"
        onChange={handleFileChange(fileField)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {formData[fileField] && typeof formData[fileField] === 'object' && (
        <span className="text-xs text-green-700">{formData[fileField].name}</span>
      )}
      <input
        type="date"
        value={formData[expiryField] || ""}
        onChange={handleChange(expiryField)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium ${
              activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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

        {activeTab === "DOCUMENTS" && (
          <>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {renderFileWithExpiry("RC Copy", "rcCopy", "rcExpiryDate")}
              {renderFileWithExpiry("Insurance Copy", "insuranceCopy", "insuranceExpiryDate")}
              {renderFileWithExpiry("Permit Copy", "permitCopy", "permitExpiryDate")}
              {renderFileWithExpiry("Pollution Certificate (PUC)", "pucCopy", "pucExpiryDate")}
              {renderFileWithExpiry("Fitness Certificate (GST)", "gstCertificate", "gstExpiryDate")}
              {renderFileWithExpiry("Tax Receipt", "taxReceipt", "taxExpiryDate")}
            </div>
            <div className="col-span-2 flex justify-between mt-4">
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
            {renderField("Alternate Mobile no.", "alternateMobile", "text")}
            {renderField("Details", "details", "text")}
            <div className="col-span-2 flex justify-between">
              <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
                Back
              </button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
                Submit
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default VehicleForm;