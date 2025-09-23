import { useState, useEffect, useCallback } from 'react';
import { INITIAL_FORM_DATA, FORM_STEPS } from '../constants/employeeFormConstants';
import {logDebug} from '../utils/logger'
export const useEmployeeForm = (mode, employee) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(FORM_STEPS.PERSONAL_INFO);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== 'create');

  // Initialize form data for edit/view modes
  useEffect(() => {
    if (mode !== 'create' && employee) {
        logDebug()
      
      const mappedData = mapEmployeeToFormData(employee);
      setFormData(mappedData);
      setIsLoading(false);
    }
  }, [mode, employee]);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(FORM_STEPS.PERSONAL_INFO);
    setCompletedSteps([]);
  };

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    setIsLoading,
    resetForm
  };
};


export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const clearError = useCallback((fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const validatePersonalInfo = useCallback((data) => {
    const errors = {};

    // Required field validation
    if (!data.name?.trim()) errors.name = 'Employee name is required';
    if (!data.employee_code?.trim()) errors.employee_code = 'Employee ID is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    if (!data.gender) errors.gender = 'Gender is required';
    if (!data.department_id) errors.department_id = 'Department is required';
    if (!data.mobile_number) errors.mobile_number = 'Phone No is required';

    // Mobile number validation
    if (data.mobile_number && !/^\d{10}$/.test(data.mobile_number)) {
      errors.mobile_number = 'Phone No must be exactly 10 digits';
    }

    // Alternate mobile validation
    if (data.alternate_mobile_number) {
      if (!/^\d{10}$/.test(data.alternate_mobile_number)) {
        errors.alternate_mobile_number = 'Alternate Phone No must be exactly 10 digits';
      }
      if (data.alternate_mobile_number === data.mobile_number) {
        errors.alternate_mobile_number = 'Alternate Phone No cannot be same as primary';
      }
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Special need date validation
    if (data.special_need && data.special_need !== 'none' && data.special_need !== null) {
      if (!data.special_need_start_date) {
        errors.special_need_start_date = 'Start date is required when special need is selected';
      }
      if (!data.special_need_end_date) {
        errors.special_need_end_date = 'End date is required when special need is selected';
      }
    }

    return errors;
  }, []);

  const validateAddressInfo = useCallback((data) => {
    const errors = {};
    if (!data.address?.trim()) errors.address = 'Address is required';
    if (!data.latitude || !data.longitude) {
      errors.location = 'Please select a location on the map';
    }
    return errors;
  }, []);

  return {
    errors,
    setErrors,
    validatePersonalInfo,
    validateAddressInfo,
    clearError
  };
};


export const useDateRange = (initialDates = null) => {
  const [dateRangeSelection, setDateRangeSelection] = useState([
    {
      startDate: initialDates?.startDate || null,
      endDate: initialDates?.endDate || null,
      key: 'selection',
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRangeSelection([ranges.selection]);
    return { startDate, endDate };
  };

  const displayDateRange = () => {
    const { startDate, endDate } = dateRangeSelection[0];
    if (!startDate || !endDate) return "";
    return `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
  };

  const resetDateRange = () => {
    setDateRangeSelection([
      {
        startDate: null,
        endDate: null,
        key: "selection"
      }
    ]);
  };

  return {
    dateRangeSelection,
    setDateRangeSelection,
    showDatePicker,
    setShowDatePicker,
    handleDateSelect,
    displayDateRange,
    resetDateRange
  };
};

// Helper function to map employee data to form data
const mapEmployeeToFormData = (employee) => {
  return {
    ...INITIAL_FORM_DATA,
    name: employee.name || '',
    employee_code: employee.userId || employee.employee_code || '',
    email: employee.email || '',
    gender: employee.gender || '',
    mobile_number: employee.phone || employee.mobile_number || '',
    alternate_mobile_number: employee.alternativePhone || employee.alternate_mobile_number || '',
    special_need: employee.specialNeed || employee.special_need || null,
    special_need_start_date: employee.specialNeedStart || employee.special_need_start_date || null,
    special_need_end_date: employee.specialNeedEnd || employee.special_need_end_date || null,
    department_id: employee.departmentId || employee.department_id || '',
    address: employee.address || '',
    landmark: employee.landmark || '',
    latitude: employee.lat || employee.latitude || null,
    longitude: employee.lng || employee.longitude || null,
    office: employee.office || '',
    subscribe_via_email: employee.subscribe_via_email || false,
    subscribe_via_sms: employee.subscribe_via_sms || false,
  };
};