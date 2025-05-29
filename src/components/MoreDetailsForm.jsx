import React from 'react';
import { Calendar } from 'lucide-react';

const MoreDetailsForm = ({ formData, onChange, errors }) => {
  return (
    <div className="animate-fadeIn px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            name="project"
            value={formData.project}
            onChange={onChange}
            className={`w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.project ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select project</option>
            <option value="Project 1">Project 1</option>
            <option value="Project 2">Project 2</option>
            <option value="Project 3">Project 3</option>
          </select>
          {errors.project && <p className="text-sm text-red-500 mt-1">{errors.project}</p>}
        </div>

        {/* Cost Centre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Centre <span className="text-red-500">*</span>
          </label>
          <select
            name="costCentre"
            value={formData.costCentre}
            onChange={onChange}
            className={`w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.costCentre ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select cost centre</option>
            <option value="STONEX">STONEX</option>
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
          </select>
          {errors.costCentre && <p className="text-sm text-red-500 mt-1">{errors.costCentre}</p>}
        </div>

        {/* Cost Centre Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Centre Date
          </label>
          <div className="relative">
            <input
              type="date"
              name="costCentreDate"
              value={formData.costCentreDate}
              onChange={onChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Business Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Unit <span className="text-red-500">*</span>
          </label>
          <select
            name="businessUnit"
            value={formData.businessUnit}
            onChange={onChange}
            className={`w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.businessUnit ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select business unit</option>
            <option value="ACCOUNTING">ACCOUNTING</option>
            <option value="SALES">SALES</option>
            <option value="MARKETING">MARKETING</option>
            <option value="OPERATIONS">OPERATIONS</option>
          </select>
          {errors.businessUnit && (
            <p className="text-sm text-red-500 mt-1">{errors.businessUnit}</p>
          )}
        </div>

        {/* Business Unit Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Unit Date
          </label>
          <div className="relative">
            <input
              type="date"
              name="businessUnitDate"
              value={formData.businessUnitDate}
              onChange={onChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Other Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Options
          </label>
          <select
            name="otherOptions"
            value={formData.otherOptions}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select other options</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MoreDetailsForm;
