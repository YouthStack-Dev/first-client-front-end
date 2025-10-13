import React from 'react';
import PropTypes from 'prop-types';
import { Pencil } from 'lucide-react';
import FormField from '../ui/FormFields';

const PersonalDetailsTabUI = ({
  formData = {
    profileImage: null,
    driverName: '',
    city: '',
    dateOfBirth: '',
    alternateMobileNumber: '',
    mobileNumber: '',
    email: '',
    password: '',
    vendor: '',
    driverId: '',
    permanentAddress: '',
    currentAddress: '',
    isSameAddress: false,
    gender: 'male'
  },
  errors = {},
  onChange = () => {},
  onImageChange = () => {},
  onCheckboxChange = () => {},
  vendors = [],
  loadingVendors = false
}) => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Profile Image */}
        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center relative mx-auto">
          {formData.profileImage ? (
            <img
              src={typeof formData.profileImage === 'string' 
                ? formData.profileImage 
                : URL.createObjectURL(formData.profileImage)}
              alt="Profile"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center p-4">
              <Pencil className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 mt-2">Add image (JPG, JPEG & PNG)</p>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="profileImageInput"
          />
        </div>

        {/* Driver Name */}
        <FormField label="Driver Name" name="driverName" required error={errors.driverName}>
          <input
            id="driverName"
            type="text"
            name="driverName"
            value={formData.driverName}
            onChange={onChange}
            placeholder="Enter driver name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* City */}
        <FormField label="City" name="city" required error={errors.city}>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder="Enter city"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Date of Birth */}
        <FormField label="Date of Birth" name="dateOfBirth" required error={errors.dateOfBirth}>
          <input
            id="dateOfBirth"
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
            id="alternateMobileNumber"
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
            id="mobileNumber"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={onChange}
            placeholder="Enter mobile number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Email */}
        <FormField label="Email" name="email" required error={errors.email}>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            autoComplete="off"
            onChange={onChange}
            placeholder="Enter email"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        {/* Password */}
        {!formData.driverId && (
          <FormField label="Password" name="password" required error={errors.password}>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              autoComplete="new-password"
              onChange={onChange}
              placeholder="Enter password"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        )}

        {/* Vendor */}
        <FormField label="Vendor" name="vendor" required error={errors.vendor}>
          <select
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loadingVendors}
          >
            <option value="">Select Vendor</option>
            {loadingVendors ? (
              <option disabled>Loading vendors...</option>
            ) : vendors?.length > 0 ? (
              vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))
            ) : (
              <option disabled>No vendors found</option>
            )}
          </select>
        </FormField>

        {/* Driver Code */}
        <FormField label="Driver Code" name="driverId" required error={errors.driverId}>
          <input
            id="driverId"
            type="text"
            name="driverId"
            value={formData.driverId}
            onChange={onChange}
            placeholder="Enter driver code"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!!formData.driverId}
          />
        </FormField>

        {/* Addresses */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Permanent Address" name="permanentAddress" error={errors.permanentAddress}>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={onChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Current Address" name="currentAddress" error={errors.currentAddress}>
              <div className="space-y-2">
                {!formData.isSameAddress && (
                  <textarea
                    id="currentAddress"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={onChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                <label className="flex items-center">
                  <input
                    id="isSameAddress"
                    type="checkbox"
                    checked={formData.isSameAddress}
                    onChange={(e) => onCheckboxChange('isSameAddress', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 ml-2">Same as Permanent Address</span>
                </label>
              </div>
            </FormField>
          </div>
        </div>

        {/* Gender */}
        <FormField label="Gender" name="gender" required error={errors.gender}>
          <div className="flex space-x-4">
            {['male', 'female', 'other'].map((g) => (
              <label key={g} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={onChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
};

PersonalDetailsTabUI.propTypes = {
  formData: PropTypes.shape({
    profileImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    driverName: PropTypes.string,
    city: PropTypes.string,
    dateOfBirth: PropTypes.string,
    alternateMobileNumber: PropTypes.string,
    mobileNumber: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    vendor: PropTypes.string,
    driverId: PropTypes.string,
    permanentAddress: PropTypes.string,
    currentAddress: PropTypes.string,
    isSameAddress: PropTypes.bool,
    gender: PropTypes.string
  }),
  errors: PropTypes.object,
  onChange: PropTypes.func,
  onImageChange: PropTypes.func,
  onCheckboxChange: PropTypes.func,
  vendors: PropTypes.arrayOf(PropTypes.shape({
    vendor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vendor_name: PropTypes.string
  })),
  loadingVendors: PropTypes.bool
};


export default PersonalDetailsTabUI;