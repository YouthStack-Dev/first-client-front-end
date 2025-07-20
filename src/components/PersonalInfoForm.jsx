import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, parseISO } from 'date-fns';

const PersonalInfoForm = ({ formData, onChange, errors, onCheckboxChange, isReadOnly }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Initialize date range from form data or use current date as default
  const [dateRangeSelection, setDateRangeSelection] = useState([
    {
      startDate: formData.dateRange?.startDate 
        ? typeof formData.dateRange.startDate === 'string'
          ? parseISO(formData.dateRange.startDate)
          : new Date(formData.dateRange.startDate)
        : new Date(),
      endDate: formData.dateRange?.endDate
        ? typeof formData.dateRange.endDate === 'string'
          ? parseISO(formData.dateRange.endDate)
          : new Date(formData.dateRange.endDate)
        : new Date(),
      key: 'selection',
    },
  ]);

  // Update form data when date range changes
  useEffect(() => {
    if (!isReadOnly && dateRangeSelection[0].startDate && dateRangeSelection[0].endDate) {
      const newDateRange = {
        startDate: format(dateRangeSelection[0].startDate, 'yyyy-MM-dd'),
        endDate: format(dateRangeSelection[0].endDate, 'yyyy-MM-dd'),
      };
      
      // Only update if dates have changed
      if (
        !formData.dateRange ||
        formData.dateRange.startDate !== newDateRange.startDate ||
        formData.dateRange.endDate !== newDateRange.endDate
      ) {
        onChange({
          target: {
            name: 'dateRange',
            value: newDateRange,
          },
        });
      }
    }
  }, [dateRangeSelection, formData.dateRange, onChange, isReadOnly]);

  // Close date picker when clicking outside
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
    if (isReadOnly) return;
    setDateRangeSelection([ranges.selection]);
  };

  const displayDateRange = () => {
    if (formData.dateRange?.startDate && formData.dateRange?.endDate) {
      const start = format(
        typeof formData.dateRange.startDate === 'string'
          ? parseISO(formData.dateRange.startDate)
          : new Date(formData.dateRange.startDate),
        'yyyy-MM-dd'
      );
      const end = format(
        typeof formData.dateRange.endDate === 'string'
          ? parseISO(formData.dateRange.endDate)
          : new Date(formData.dateRange.endDate),
        'yyyy-MM-dd'
      );
      return `${start} - ${end}`;
    }
    return '';
  };

  // Common input class utility function
  const getInputClasses = (hasError) => {
    return `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`;
  };

  // Common select classes utility function
  const getSelectClasses = (hasError) => {
    return `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;
  };

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName || ''}
            onChange={onChange}
            className={getInputClasses(errors.employeeName)}
            placeholder="Enter employee name"
            disabled={isReadOnly}
          />
          {errors.employeeName && (
            <p className="mt-1 text-sm text-red-500">{errors.employeeName}</p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employee_code"
            value={formData.employee_code || ''}
            onChange={onChange}
            className={getInputClasses(errors.employee_code)}
            placeholder="Enter employee ID"
            disabled={isReadOnly}
          />
          {errors.employee_code && (
            <p className="mt-1 text-sm text-red-500">{errors.employee_code}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="emailId"
            value={formData.emailId || ''}
            onChange={onChange}
            className={getInputClasses(errors.emailId)}
            placeholder="Enter email ID"
            disabled={isReadOnly}
          />
          {errors.emailId && (
            <p className="mt-1 text-sm text-red-500">{errors.emailId}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={onChange}
            className={getSelectClasses(errors.gender)}
            disabled={isReadOnly}
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

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber || ''}
            onChange={onChange}
            className={getInputClasses(false)}
            placeholder="Enter mobile number"
            disabled={isReadOnly}
          />
        </div>

        {/* Alternate Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Mobile Number
          </label>
          <input
            type="tel"
            name="alternateMobileNumber"
            value={formData.alternateMobileNumber || ''}
            onChange={onChange}
            className={getInputClasses(errors.alternateMobileNumber)}
            placeholder="Enter alternate mobile number"
            disabled={isReadOnly}
          />
          {errors.alternateMobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.alternateMobileNumber}</p>
          )}
        </div>

        {/* Office */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office <span className="text-red-500">*</span>
          </label>
          <select
            name="office"
            value={formData.office || ''}
            onChange={onChange}
            className={getSelectClasses(errors.office)}
            disabled={isReadOnly}
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

        {/* Special Need */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Need
          </label>
          <select
            name="specialNeed"
            value={formData.specialNeed || 'None'}
            onChange={onChange}
            className={getSelectClasses(false)}
            disabled={isReadOnly}
          >
            <option value="None">None</option>
            <option value="Wheelchair">Wheelchair</option>
            <option value="Visual Assistance">Visual Assistance</option>
            <option value="Hearing Assistance">Hearing Assistance</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="relative" ref={datePickerRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <input
            type="text"
            name="dateRangeDisplay"
            value={displayDateRange()}
            onClick={() => !isReadOnly && setShowDatePicker(!showDatePicker)}
            readOnly
            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
            }`}
            placeholder="Select date range"
          />
          {showDatePicker && !isReadOnly && (
            <div className="absolute z-10 mt-1 shadow-lg rounded-md overflow-hidden bg-white">
              <DateRange
                ranges={dateRangeSelection}
                onChange={handleDateSelect}
                moveRangeOnFirstSelection={false}
                months={1}
                direction="horizontal"
                className="date-range-picker"
              />
            </div>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department || ''}
            onChange={onChange}
            className={getSelectClasses(errors.department)}
            disabled={isReadOnly}
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