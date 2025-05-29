import React from 'react';
import FormField from './FormField';

const DriverTab = ({ formData, errors, onChange }) => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <FormField 
          label="Driver" 
          name="driver" 
          required 
          error={errors.driver}
        >
          <select
            name="driver"
            value={formData.driver}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Driver</option>
            <option value="driver1">Driver 1</option>
            <option value="driver2">Driver 2</option>
            <option value="driver3">Driver 3</option>
          </select>
        </FormField>

        <FormField 
          label="Garage name" 
          name="garageName" 
          required 
          error={errors.garageName}
        >
          <input
            type="text"
            name="garageName"
            value={formData.garageName}
            onChange={onChange}
            placeholder="Enter Garage name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Mobile no." 
          name="mobileNo"
        >
          <input
            type="text"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={onChange}
            placeholder="Enter Mobile no."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Garage geocode" 
          name="garageGeocode" 
          required 
          error={errors.garageGeocode}
        >
          <input
            type="text"
            name="garageGeocode"
            value={formData.garageGeocode}
            onChange={onChange}
            placeholder="Enter Garage geocode"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            Garage GeoCords must be at least 9 characters long and must be in the format "num, num". eg 17.328026,78.274069
          </p>
        </FormField>

        <FormField 
          label="Alternate Mobile no." 
          name="alternateMobileNo"
        >
          <input
            type="text"
            name="alternateMobileNo"
            value={formData.alternateMobileNo}
            onChange={onChange}
            placeholder="Enter Alternate Mobile no."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <FormField 
          label="Details" 
          name="details"
        >
          <input
            type="text"
            name="details"
            value={formData.details}
            onChange={onChange}
            placeholder="Enter Details"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField 
            label="Comments" 
            name="comments"
          >
            <textarea
              name="comments"
              value={formData.comments}
              onChange={onChange}
              placeholder="Enter"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default DriverTab;
