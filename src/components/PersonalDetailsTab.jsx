import React from 'react';
import FormField from './FormField';
import { Pencil } from 'lucide-react';

const PersonalDetailsTab = ({
  formData,
  errors,
  onChange,
  onImageChange,
  onCheckboxChange,
}) => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Profile Image Upload */}
        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center relative mx-auto">
            {formData.profileImage ? (
              <img
                src={URL.createObjectURL(formData.profileImage)}
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center p -4">
                <Pencil className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-2">Add image (JPG, JPEG & PNG)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        {/* Driver Name */}
        <FormField label="Driver Name" name="driverName" required error={errors.driverName}>
          <input
            type="text"
            name="driverName"
            value={formData.driverName}
            onChange={onChange}
            placeholder="Enter driver name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </FormField>

        {/* City */}
        <FormField label="City" name="city" required error={errors.city}>
          <select
            name="city"
            value={formData.city}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select City</option>
            <option value="city1">City 1</option>
            <option value="city2">City 2</option>
          </select>
        </FormField>

        {/* Date of Birth */}
        <FormField label="Date of Birth" name="dateOfBirth" required error={errors.dateOfBirth}>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Alternate Mobile Number */}
        <FormField label="Alternate Mobile Number" name="alternateMobileNumber" error={errors.alternateMobileNumber}>
          <input
            type="tel"
            name="alternateMobileNumber"
            value={formData.alternateMobileNumber}
            onChange={onChange}
            placeholder="Enter alternate mobile number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Mobile Number */}
        <FormField label="Mobile Number" name="mobileNumber" required error={errors.mobileNumber}>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={onChange}
            placeholder="Enter mobile number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Vendor */}
        <FormField label="Vendor" name="vendor" required error={errors.vendor}>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Vendor</option>
            <option value="vendor1">Vendor 1</option>
            <option value="vendor2">Vendor 2</option>
          </select>
        </FormField>

        {/* Driver ID */}
        <FormField label="Driver ID" name="driverId" error={errors.driverId}>
          <input
            type="text"
            name="driverId"
            value={formData.driverId}
            onChange={onChange}
            placeholder="Enter driver ID"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Permanent Address */}
        <div className=" flex md:grid md:grid-cols-2 md:gap-4 ">
  {/* Permanent Address */}
  <FormField label="Permanent Address" name="permanentAddress" error={errors.permanentAddress}>
    <textarea
      name="permanentAddress"
      value={formData.permanentAddress}
      onChange={onChange}
      rows={3}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </FormField>

  {/* Current Address */}
  <FormField label="Current Address" name="currentAddress" error={errors.currentAddress}>
    <div className="space-y-2">
     
      {!formData.isSameAddress && (
        <textarea
          name="currentAddress"
          value={formData.currentAddress}
          onChange={onChange}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
       <label className="flex items-center ">
        <input
          type="checkbox"
          checked={formData.isSameAddress}
          onChange={(e) => onCheckboxChange('isSameAddress', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">Same as Permanent Address</span>
      </label>
    </div>
  </FormField>
</div>


        {/* Gender */}
        <FormField label="Gender" name="gender" required error={errors.gender}>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={onChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={onChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Female</span>
            </label>
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default PersonalDetailsTab;
