import React, { useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { logDebug } from '../../utils/logger';

const PersonalInfoForm = ({
  formData,
  onChange,
  errors,
  isReadOnly,
  showDatePicker,
  setShowDatePicker,
  dateRangeSelection,
  handleDateSelect,
  displayDateRange,
  teams = [],
  loadingTeams = false
}) => {
  const datePickerRef = useRef(null);
logDebug('this is the teams', teams);
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
  }, [setShowDatePicker]);

  const getInputClasses = (hasError) =>
    `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const getSelectClasses = (hasError) =>
    `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

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
            name="name"
            value={formData.name || ''}
            onChange={onChange}
            className={getInputClasses(errors.name)}
            placeholder="Enter employee name"
            disabled={isReadOnly}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userId"
            value={formData.userId || ''}
            onChange={onChange}
            className={getInputClasses(errors.userId)}
            placeholder="Enter employee ID"
            disabled={isReadOnly}
          />
          {errors.userId && (
            <p className="mt-1 text-sm text-red-500">{errors.userId}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            className={getInputClasses(errors.email)}
            placeholder="Enter email ID"
            disabled={isReadOnly}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
            <option value="OTHERS">OTHER</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number  <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={onChange}
            className={getInputClasses(false)}
            placeholder="Enter mobile number"
            disabled={isReadOnly}

          />
           {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Alternate Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Mobile Number
          </label>
          <input
            type="tel"
            name="alternativePhone"
            value={formData.alternativePhone || ''}
            onChange={onChange}
            className={getInputClasses(errors.alternativePhone)}
            placeholder="Enter alternate mobile number"
            disabled={isReadOnly}
          />
          {errors.alternativePhone && (
            <p className="mt-1 text-sm text-red-500">{errors.alternativePhone}</p>
          )}
        </div>

        {/* Special Need */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Need
          </label>
          <select
            name="specialNeed"
            value={formData.specialNeed || 'none'}
            onChange={onChange}
            className={getSelectClasses(false)}
            disabled={isReadOnly}
          >
            <option value="none">None</option>
            <option value="PREGNANT">Pregnancy</option>
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
              />
            </div>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          {loadingTeams ? (
            <p className="text-sm text-gray-500">Loading departments...</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-red-500">
              No teams found. A team is needed to create employees.
            </p>
          ) : (
            <select
              name="departmentId"
              value={formData.departmentId || ''}
              onChange={onChange}
              className={getSelectClasses(errors.departmentId)}
              disabled={isReadOnly}
            >
              <option value="">Select Department</option>
              {teams.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}
          {errors.departmentId && (
            <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;