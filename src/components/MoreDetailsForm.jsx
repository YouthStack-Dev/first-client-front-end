import React from 'react';
import { EmployeeFormData } from '../types';
import { Calendar } from 'lucide-react';

const MoreDetailsForm = ({ formData, onChange, errors }) => {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            name="project"
            value={formData.project}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
              errors.project ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select project</option>
            <option value="Project 1">Project 1</option>
            <option value="Project 2">Project 2</option>
            <option value="Project 3">Project 3</option>
          </select>
          {errors.project && (
            <p className="mt-1 text-sm text-red-500">{errors.project}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Centre <span className="text-red-500">*</span>
          </label>
          <select
            name="costCentre"
            value={formData.costCentre}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
              errors.costCentre ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select cost centre</option>
            <option value="STONEX">STONEX</option>
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
          </select>
          {errors.costCentre && (
            <p className="mt-1 text-sm text-red-500">{errors.costCentre}</p>
          )}
        </div>

        <div className="hidden md:block"></div>

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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button className="absolute top-8 right-12 text-gray-500 hover:text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Unit <span className="text-red-500">*</span>
          </label>
          <select
            name="businessUnit"
            value={formData.businessUnit}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
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
            <p className="mt-1 text-sm text-red-500">{errors.businessUnit}</p>
          )}
        </div>

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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button className="absolute top-8 right-12 text-gray-500 hover:text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Options
          </label>
          <select
            name="otherOptions"
            value={formData.otherOptions}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
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
