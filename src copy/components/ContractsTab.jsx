import React from 'react';
import FormField from './FormField';

const ContractsTab = ({ 
  formData, 
  errors, 
  onChange,
  onRadioChange
}) => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <FormField 
          label="Vehicle Type" 
          name="vehicleType" 
          required 
          error={errors.vehicleType}
        >
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Vehicle Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
          </select>
        </FormField>

        <FormField 
          label="Change Contract From" 
          name="changeContractFrom" 
          required 
          error={errors.changeContractFrom}
        >
          <select
            name="changeContractFrom"
            value={formData.changeContractFrom}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Change Contract From</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        </FormField>

        <FormField 
          label="Contract" 
          name="contract" 
          required 
          error={errors.contract}
        >
          <input
            type="text"
            name="contract"
            value={formData.contract}
            onChange={onChange}
            placeholder="NA"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
          <p className="mt-1 text-xs text-gray-600">
            Please select Vendor/Vehicle Type first
          </p>
        </FormField>

        <FormField 
          label="Start Time" 
          name="startTime"
        >
          <div className="flex space-x-2">
            <select
              name="startTimeHour"
              value={formData.startTimeHour}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(24)].map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <select
              name="startTimeMinute"
              value={formData.startTimeMinute}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        <FormField 
          label="Working Time (min)" 
          name="workingTime" 
          required 
          error={errors.workingTime}
        >
          <input
            type="number"
            name="workingTime"
            value={formData.workingTime}
            onChange={onChange}
            placeholder="1440"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Send Audit SMS" 
          name="sendAuditSms"
        >
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="smsToDriver"
                name="sendAuditSms"
                checked={formData.sendAuditSms === 'driver'}
                onChange={() => onRadioChange('driver')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="smsToDriver" className="ml-2 text-sm text-gray-700">
                Driver
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="smsToOther"
                name="sendAuditSms"
                checked={formData.sendAuditSms === 'other'}
                onChange={() => onRadioChange('other')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="smsToOther" className="ml-2 text-sm text-gray-700">
                To Other
              </label>
            </div>
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default ContractsTab;
