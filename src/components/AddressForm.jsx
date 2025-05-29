import React from 'react';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';

const AddressForm = ({ formData, onChange, onCheckboxChange, errors }) => {
  return (
    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Map Left */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <MapPin className="w-12 h-12 text-gray-400" />
          <p className="text-gray-500 mt-2">Map View (Google Maps API Integration)</p>
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button className="bg-white p-2 rounded-md shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
          <button className="bg-white p-2 rounded-md shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md shadow-md text-sm">
          Distance: 0 km
        </div>
      </div>

      {/* Form Right */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter address"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geo Coordinates</label>
          <input
            type="text"
            name="geoCoordinates"
            value={formData.geoCoordinates}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Latitude, Longitude"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter landmark"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nodal Point</label>
          <select
            name="nodalPoint"
            value={formData.nodalPoint}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          >
            <option value="">Select nodal point</option>
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="showAll"
            checked={formData.showAll}
            onChange={(e) => onCheckboxChange('showAll', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
          />
          <label htmlFor="showAll" className="ml-2 text-sm text-gray-700">Show all</label>
        </div>
      </div>
    </div>
  );
};

AddressForm.propTypes = {
  formData: PropTypes.shape({
    address: PropTypes.string,
    geoCoordinates: PropTypes.string,
    landmark: PropTypes.string,
    nodalPoint: PropTypes.string,
    showAll: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default AddressForm;
