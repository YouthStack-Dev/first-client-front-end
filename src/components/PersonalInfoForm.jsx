import React from 'react';

const PersonalInfoForm = ({
  formData,
  onChange,
  onCheckboxChange,
  errors,
}) => {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.employeeName ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter employee name"
          />
          {errors.employeeName && (
            <p className="mt-1 text-sm text-red-500">{errors.employeeName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.employeeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter employee ID"
          />
          {errors.employeeId && (
            <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.emailId ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter email ID"
          />
          {errors.emailId && (
            <p className="mt-1 text-sm text-red-500">{errors.emailId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
              errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select gender</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter mobile number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Mobile Number
          </label>
          <input
            type="tel"
            name="alternateMobileNumber"
            value={formData.alternateMobileNumber}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.alternateMobileNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter alternate mobile number"
          />
          {errors.alternateMobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.alternateMobileNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office <span className="text-red-500">*</span>
          </label>
          <select
            name="office"
            value={formData.office}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
              errors.office ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select office</option>
            <option value="STONEX_PUNE">STONEX_PUNE</option>
            <option value="STONEX_MUMBAI">STONEX_MUMBAI</option>
            <option value="STONEX_DELHI">STONEX_DELHI</option>
          </select>
          {errors.office && (
            <p className="mt-1 text-sm text-red-500">{errors.office}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Need
          </label>
          <select
            name="specialNeed"
            value={formData.specialNeed}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          >
            <option value="None">None</option>
            <option value="Wheelchair">Wheelchair</option>
            <option value="Visual Assistance">Visual Assistance</option>
            <option value="Hearing Assistance">Hearing Assistance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <input
            type="text"
            name="dateRange"
            value={formData.dateRange}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="YYYY-MM-DD - YYYY-MM-DD"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="transportUser"
            checked={formData.transportUser}
            onChange={(e) => onCheckboxChange('transportUser', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
          />
          <label htmlFor="transportUser" className="ml-2 text-sm text-gray-700">
            Transport User
          </label>
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Subscribe Via</p>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscribeEmail"
                checked={formData.subscribeEmail}
                onChange={(e) => onCheckboxChange('subscribeEmail', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
              />
              <label htmlFor="subscribeEmail" className="ml-2 text-sm text-gray-700">
                E-MAIL
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscribeSms"
                checked={formData.subscribeSms}
                onChange={(e) => onCheckboxChange('subscribeSms', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
              />
              <label htmlFor="subscribeSms" className="ml-2 text-sm text-gray-700">
                SMS
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="mobileApp"
            checked={formData.mobileApp}
            onChange={(e) => onCheckboxChange('mobileApp', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
          />
          <label htmlFor="mobileApp" className="ml-2 text-sm text-gray-700">
            Mobile App
          </label>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
