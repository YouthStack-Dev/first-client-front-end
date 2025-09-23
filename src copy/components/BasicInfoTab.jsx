import React from 'react';
import FormField from './FormField';

const BasicInfoTab = ({ 
  formData, 
  errors, 
  onChange,
  onDateChange
}) => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <FormField 
          label="Vendor" 
          name="vendor" 
          required 
          error={errors.vendor}
        >
          <select
            name="vendor"
            value={formData.vendor}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Vendor</option>
            <option value="vendor1">Vendor 1</option>
            <option value="vendor2">Vendor 2</option>
            <option value="vendor3">Vendor 3</option>
          </select>
        </FormField>

        <FormField 
          label="Vehicle ID" 
          name="vehicleId" 
          required 
          error={errors.vehicleId}
        >
          <input
            type="text"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={onChange}
            placeholder="Enter Vehicle ID"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Registration no." 
          name="registrationNo" 
          required 
          error={errors.registrationNo}
        >
          <input
            type="text"
            name="registrationNo"
            value={formData.registrationNo}
            onChange={onChange}
            placeholder="Ex: KA-01-AB-0123"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Status" 
          name="status"
        >
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={onChange}
            placeholder="Inactive from 07 May 2025"
            disabled
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </FormField>

        <FormField 
          label="SIM number" 
          name="simNumber"
        >
          <input
            type="text"
            name="simNumber"
            value={formData.simNumber}
            onChange={onChange}
            placeholder="Enter SIM number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Device IMEI number" 
          name="deviceImei"
        >
          <select
            name="deviceImei"
            value={formData.deviceImei}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Device IMEI number</option>
            <option value="imei1">IMEI 1</option>
            <option value="imei2">IMEI 2</option>
          </select>
          <p className="mt-1 text-xs text-gray-600">
            Devices which are unassigned, may not be available for re-assignment immediately. 
            Please keep the device on and reload this page 5-10 mins after un-assigning the device.
          </p>
        </FormField>

        <FormField 
          label="Change status" 
          name="changeStatus"
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              id="changeStatus"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <input
              type="date"
              value={formData.statusDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="ml-4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default BasicInfoTab;
