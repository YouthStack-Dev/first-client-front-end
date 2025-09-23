// constants/employeeFormConstants.js

export const INITIAL_FORM_DATA = {
    name: '',
    email: '',
    gender: '',
    employee_code: '',
    mobile_number: '',
    alternate_mobile_number: '',
    address: '',
    landmark: '',
    latitude: null,
    longitude: null,
    special_need: null,
    special_need_start_date: null,
    special_need_end_date: null,
    department_id: '',
    office: '',
    subscribe_via_email: false,
    subscribe_via_sms: false,
  };
  
  export const FORM_STEPS = {
    PERSONAL_INFO: 'personalInfo',
    ADDRESS: 'address',
  };
  
  export const GENDER_OPTIONS = [
    { value: '', label: 'Select gender' },
    { value: 'Male', label: 'MALE' },
    { value: 'Female', label: 'FEMALE' },
    { value: 'Others', label: 'OTHER' },
  ];
  
  export const SPECIAL_NEED_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'pregnancy', label: 'Pregnancy' },
  ];
  
  export const VALIDATION_RULES = {
    MOBILE_REGEX: /^\d{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };
  
  export const ERROR_MESSAGES = {
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_MOBILE: 'Phone No must be exactly 10 digits',
    INVALID_EMAIL: 'Please enter a valid email address',
    DUPLICATE_MOBILE: 'Alternate Phone No cannot be same as primary',
    MISSING_DATES: 'Start and end dates are required when special need is selected',
    MISSING_LOCATION: 'Please select a location on the map',
    ADDRESS_REQUIRED: 'Address is required',
  };
  
  export const API_ENDPOINTS = {
    EMPLOYEES: 'employees/',
    DEPARTMENTS: 'departments/',
  };
  
  export const FORM_MODE = {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view',
  };