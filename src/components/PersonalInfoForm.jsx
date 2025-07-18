import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range'; // Changed from DateRangePicker to DateRange
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format } from 'date-fns';

const PersonalInfoForm = ({
  formData,
  onChange,
  errors,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Initialize with values from formData or sensible defaults
  // Ensure startDate and endDate are Date objects for react-date-range
  const [dateRangeSelection, setDateRangeSelection] = useState([
    {
      startDate: formData.dateRange && formData.dateRange.startDate ? new Date(formData.dateRange.startDate) : new Date(),
      endDate: formData.dateRange && formData.dateRange.endDate ? new Date(formData.dateRange.endDate) : new Date(),
      key: 'selection',
    },
  ]);

  // Effect to update form data when dateRangeSelection changes
  useEffect(() => {
    if (dateRangeSelection[0].startDate && dateRangeSelection[0].endDate) {
      const newDateRange = {
        startDate: format(dateRangeSelection[0].startDate, 'yyyy-MM-dd'),
        endDate: format(dateRangeSelection[0].endDate, 'yyyy-MM-dd'),
      };
      // Only call onChange if the date range has actually changed
      if (
        formData.dateRange?.startDate !== newDateRange.startDate ||
        formData.dateRange?.endDate !== newDateRange.endDate
      ) {
        onChange({
          target: {
            name: 'dateRange',
            value: newDateRange,
          },
        });
      }
    }
  }, [dateRangeSelection, formData.dateRange, onChange]);

  // Handle clicks outside the date picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateSelect = (ranges) => {
    setDateRangeSelection([ranges.selection]);
  };

  const displayDateRange = () => {
    if (dateRangeSelection[0].startDate && dateRangeSelection[0].endDate) {
      const start = format(dateRangeSelection[0].startDate, 'yyyy-MM-dd');
      const end = format(dateRangeSelection[0].endDate, 'yyyy-MM-dd');
      return `${start} - ${end}`;
    }
    return '';
  };

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
            name="employee_code"
            value={formData.employee_code}
            onChange={onChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.employee_code ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter employee ID"
          />
          {errors.employee_code && (
            <p className="mt-1 text-sm text-red-500">{errors.employee_code}</p>
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

        {/* Date Range Picker (Calendar only) Integration */}
        <div className="relative" ref={datePickerRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <input
            type="text"
            name="dateRangeDisplay"
            value={displayDateRange()}
            onClick={() => setShowDatePicker(!showDatePicker)}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
            placeholder="Select date range"
          />
          {showDatePicker && (
            <div className="absolute z-10 mt-1 shadow-lg rounded-md overflow-hidden bg-white">
              <DateRange // Changed component here
                ranges={dateRangeSelection}
                onChange={handleDateSelect}
                moveRangeOnFirstSelection={false}
                months={1}
                direction="horizontal"
                className="date-range-picker"
                // No showSelectionPreview or other props needed, DateRange is simpler
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          >
            <option value="">Select Department</option>
            <option value="HR">HR</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>
          {errors.department && (
            <p className="mt-1 text-sm text-red-500">{errors.department}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;