import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FormSteps from './FormSteps';
import PersonalInfoForm from './PersonalInfoForm';
import NavigationButtons from './NavigationButtons';
import HeaderWithAction from '../HeaderWithAction';
import EmployeeAddressGoogleMapView from '../Map';
import {  toast } from 'react-toastify';
import { format, parseISO, set } from 'date-fns';
import { logDebug, logError } from '../../utils/logger';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllTeams } from '../../redux/features/user/userSelectors';
import { setTeams } from '../../redux/features/user/userSlice';
import { API_CLIENT } from '../../Api/API_Client';
import { useNavigate } from 'react-router-dom';
import { fetchDepartments } from '../../redux/features/user/userTrunk';

const initialFormData = {
  name: '',
  email: '',
  gender: '',
  employee_code:"",
  mobile_number: '',
  alternate_mobile_number: '',
  address: '',
  landmark: '',
  latitude: null,
  longitude: null,
  distance_from_company: '',

  special_need:"none",
  office:""
};

const EmployeeForm = ({ mode = 'create' }) => {
  const { state } = useLocation();
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState('personalInfo');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== 'create');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const teams = useSelector(selectAllTeams);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { depId } = useParams();
  const [dateRangeSelection, setDateRangeSelection] = useState([
    {
      startDate: parseISO(formData.special_need_start_date || new Date().toISOString()),
      endDate: parseISO(formData.special_need_end_date || new Date().toISOString()),
      key: 'selection',
    },
  ]);

   if(mode === 'view' && !state?.employee) {


   }


  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRangeSelection([ranges.selection]);

    setFormData(prev => ({
      ...prev,
      special_need_start_date: startDate.toISOString().split('T')[0],
    special_need_end_date: endDate.toISOString().split('T')[0],
    }));
  };

  const displayDateRange = () => {
    const { startDate, endDate } = dateRangeSelection[0];
    if (!startDate || !endDate) return "";
    return `${format(startDate, "yyyy-MM-dd")} - ${format(endDate, "yyyy-MM-dd")}`;
  };


  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetchDepartments();
        dispatch(setTeams(response));
      } catch (error) {
        logError('Error fetching teams:', error);
        toast.error('Failed to load departments');
      }
    };

    if (!teams || teams.length === 0) {
      fetchTeams();
    }
  }, [dispatch, teams]);

  useEffect(() => {
    if (mode !== 'create') {

      logError(" this is the stae data " ,state);
      
      const employee = state?.employee;
      if (employee) {
        const mappedData = {
          ...initialFormData,
          name: employee.name || '',
          employee_code: employee.employee_code || '',
          email: employee.email || '',
          gender: employee.gender || '',
          mobile_number:  employee.mobile_number || '',
          alternate_mobile_number: employee.alternate_mobile_number || '',
          special_need: employee.special_need || 'none',
          department_id: depId  ,
          address: employee.address || '',
          landmark: employee.landmark || '',
          latitude: employee.latitude || '',
          longitude: employee.longitude || '',
          distance_from_company: employee.distance_from_company || '',
        };
        setFormData(mappedData);
        
        // Update date range selection if dateRange exists
        if (employee?.special_need_start_date && employee?.special_need_end_date) {
          setDateRangeSelection([
            {
              startDate: new Date(employee.special_need_start_date),
              endDate: new Date(employee.special_need_end_date),
              key: "selection"
            }
          ]);
        }
      }
      setIsLoading(false);
    }
  }, [mode, state, teams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  logDebug('Input change:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'department_id' || name === 'roleId' // fields you want as integers
          ? value === '' ? '' : parseInt(value, 10)
          : value
    }));
  
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  const validatePersonalInfo = (data) => {
    const errors = {};
  
    // Trim-safe validation for required fields
    if (!data.name?.trim()) errors.name = 'Employee name is required';
    if (!data.employee_code?.trim()) errors.employee_code = 'Employee ID is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    if (!data.gender) errors.gender = 'Gender is required';
    if (!data.department_id) errors.department_id = 'Department is required';
    if (!data.mobile_number) errors.mobile_number = 'Phone No is required';
  
    // Mobile number length check (exactly 10 digits)
    if (data.mobile_number && !/^\d{10}$/.test(data.mobile_number)) {
      errors.mobile_number = 'Phone No must be exactly 10 digits';
    }
  
    // Alternate mobile number check (if present)
    if (data.alternate_mobile_number) {
      if (!/^\d{10}$/.test(data.alternate_mobile_number)) {
        errors.alternate_mobile_number = 'Alternate Phone No must be exactly 10 digits';
      }
      if (data.alternate_mobile_number === data.mobile_number) {
        errors.alternate_mobile_number = 'Alternate Phone No cannot be same as primary';
      }
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
  
    return errors;
  };
  

  const validateAddressInfo = (data) => {
    const errors = {};
    if (!data.address.trim()) errors.address = 'Address is required';
    if (!data.latitude || !data.latitude) {
      errors.location = 'Please select a location on the map';
    }
    return errors;
  };

  const handleNext = () => {
    if (currentStep === 'personalInfo') {
      const validationErrors = validatePersonalInfo(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Please fill out all required fields in Personal Information');
        return;
      }
    }
    
    setCurrentStep('address');
    if (!completedSteps.includes('personalInfo')) {
      setCompletedSteps(prev => [...prev, 'personalInfo']);
    }
  };

  const handleBack = () => {
    setCurrentStep('personalInfo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Final validation
    const personalErrors = validatePersonalInfo(formData);
    const addressErrors = validateAddressInfo(formData);
    const allErrors = { ...personalErrors, ...addressErrors };
  
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      logDebug('Form submission errors:', allErrors);
      toast.error('Please fix all errors before submitting');
      setIsSubmitting(false);
      return;
    }
    try {
  
      const submissionData = {
        ...formData,
      };
  
      // Make the API call
      const response =
        mode === 'create'
          ? await API_CLIENT.post('employees/', submissionData)
          : await API_CLIENT.put(`/employees/${formData.employee_code}`, submissionData);
  
      if (response.status >= 200 && response.status < 300) {
        toast.success(`Employee ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        if (mode === 'create') {
          setFormData(initialFormData);
          setCurrentStep('personalInfo');
          setCompletedSteps([]);
   
        }
      } else {
        toast.error(response.data?.detail || `Failed to ${mode === 'create' ? 'create' : 'update'} employee`);
      }
  
    } catch (error) {
      logError('Submission error:', error);

      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.message}`) // format: "phone: Phone number must be exactly 10 digits"
          .join('\n'); // join them with line breaks
      
        toast.error(errorMessages);
      } else {
        toast.error(
          error.response?.data?.message ||
          `Failed to ${mode === 'create' ? 'create' : 'update'} employee`
        );
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const isFirstStep = currentStep === 'personalInfo';
  const isLastStep = currentStep === 'address';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading employee data...</span>
      </div>
    );
  }

  return (
    <>
      <HeaderWithAction 
        title={mode === 'create' ? 'NEW EMPLOYEE' : mode === 'edit' ? 'EDIT EMPLOYEE' : 'EMPLOYEE DETAILS'} 
        showBackButton={true} 
      />
      <div className='p-2 m-3 bg-white rounded-xl'>
        {mode === 'view' ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <PersonalInfoForm
                formData={formData}
                onChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                errors={errors}
                isReadOnly={true}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                dateRangeSelection={dateRangeSelection}
                handleDateSelect={handleDateSelect}
                displayDateRange={displayDateRange}
                teams={teams}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Address Information</h2>
              <EmployeeAddressGoogleMapView 
                formData={formData} 
                setFormData={setFormData}
                setErrors={setErrors}
                isReadOnly={true}
              />
            </div>
            <NavigationButtons
              currentStep="complete"
             onSubmit={()=>navigate(-1)}
              isLastStep={true}
              mode={mode}
            />
          </>
        ) : (
          <>
            <FormSteps currentStep={currentStep} completedSteps={completedSteps} />
            <div className="mt-6 m-3">
              {currentStep === 'personalInfo' ? (
                <PersonalInfoForm
                  formData={formData}
                  onChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  errors={errors}
                  isReadOnly={false}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                  dateRangeSelection={dateRangeSelection}
                  handleDateSelect={handleDateSelect}
                  displayDateRange={displayDateRange}
                  teams={teams}
                />
              ) : (
                <EmployeeAddressGoogleMapView 
                handleInputChange={handleInputChange}
                  formData={formData} 
                  setFormData={setFormData}
                  setErrors={setErrors}
                  isReadOnly={false}
                />
              )}
            </div>
            <NavigationButtons
              currentStep={currentStep}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isLastStep={isLastStep}
              isFirstStep={isFirstStep}
              isSubmitting={isSubmitting}
              mode={mode}
            />
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeForm;