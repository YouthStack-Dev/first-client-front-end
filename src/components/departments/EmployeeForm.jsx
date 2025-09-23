import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Components
import FormSteps from './FormSteps';
import PersonalInfoForm from './PersonalInfoForm';
import NavigationButtons from './NavigationButtons';
import HeaderWithAction from '../HeaderWithAction';
import EmployeeAddressGoogleMapView from '../Map';

// Utils & Services
import { logDebug, logError } from '../../utils/logger';
import { selectAllTeams } from '../../redux/features/user/userSelectors';
import { setDepartments } from '../../redux/features/user/userSlice';
import { API_CLIENT } from '../../Api/API_Client';
import { fetchDepartments } from '../../redux/features/user/userTrunk';

// Validation
import { 
  validatePersonalInfo, 
  validateAddressInfo,
  validateEmployeeForm,
  formatFormDataForValidation 
} from './validationUtils';

const initialFormData = {
  name: '',
  email: '',
  gender: '',
  userId: '',
  phone: '',
  alternativePhone: '',
  address: '',
  landmark: '',
  latitude: null,
  longitude: null,
  specialNeed: null,
  specialNeedStart: null,
  specialNeedEnd: null,
  bloodGroup: '',
  emergencyPhone: '',
  emergencyContact: '',
  departmentId: '',
  roleId: '',
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
  const { depId, userId } = useParams();

  const [dateRangeSelection, setDateRangeSelection] = useState([
    { startDate: null, endDate: null, key: 'selection' },
  ]);

  if (mode === 'view' && !state?.employee) {
    // Handle missing employee data
  }

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRangeSelection([ranges.selection]);

    if (formData.specialNeed !== 'none') {
      setFormData(prev => ({
        ...prev,
        specialNeedStart: startDate.toISOString().split('T')[0],
        specialNeedEnd: endDate.toISOString().split('T')[0],
      }));
    }
  };

  const displayDateRange = () => {
    if (formData.specialNeed === 'none') return "";
    
    const { startDate, endDate } = dateRangeSelection[0];
    if (!startDate || !endDate) return "";
    return `${format(startDate, "yyyy-MM-dd")} - ${format(endDate, "yyyy-MM-dd")}`;
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetchDepartments();
        dispatch(setDepartments(response));
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
      const employee = state?.employee;

      logDebug('Employee data from state:', employee);
      if (employee) {
        const mappedData = {
          ...initialFormData,
          name: employee.name || '',
          userId: employee.userId || '',
          email: employee.email || '',
          gender: employee.gender || '',
          phone: employee.phone || '',
          alternativePhone: employee.alternativePhone || '',
          specialNeed: employee.specialNeed || 'none',
          specialNeedStart: employee.specialNeed === 'none' ? null : (employee.specialNeedStart || null),
          specialNeedEnd: employee.specialNeed === 'none' ? null : (employee.specialNeedEnd || null),
          departmentId: employee.departmentId || '',
          roleId: employee.role?.id || '',
          address: employee.address || '',
          landmark: employee.landmark || '',
          latitude: employee.lat || null,
          longitude: employee.lng || null,
          bloodGroup: employee.additionalInfo?.bloodGroup || '',
          emergencyPhone: employee.additionalInfo?.emergencyPhone || '',
          emergencyContact: employee.additionalInfo?.emergencyContact || '',
        };
        setFormData(mappedData);
        
        if (employee?.specialNeed !== 'none' && employee?.specialNeedStart && employee?.specialNeedEnd) {
          setDateRangeSelection([
            {
              startDate: new Date(employee.specialNeedStart),
              endDate: new Date(employee.specialNeedEnd),
              key: "selection"
            }
          ]);
        } else {
          setDateRangeSelection([
            {
              startDate: null,
              endDate: null,
              key: "selection"
            }
          ]);
        }
      }
      setIsLoading(false);
    }
  }, [mode, state, teams, depId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    logDebug('Input change:', name, value);
    
    if (name === 'specialNeed') {
      if (value === 'none') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          specialNeedStart: null,
          specialNeedEnd: null
        }));
        
        setDateRangeSelection([
          {
            startDate: null,
            endDate: null,
            key: "selection"
          }
        ]);
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]:
          name === 'departmentId' || name === 'roleId'
            ? value === '' ? '' : parseInt(value, 10)
            : value
      }));
    }
  
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

  const handleNext = () => {
    if (currentStep === 'personalInfo') {
      const formattedData = formatFormDataForValidation(formData);
      const validationResult = validatePersonalInfo(formattedData);
      
      if (!validationResult.success) {
        setErrors(validationResult.errors);
        logError('Validation errors:', validationResult.errors);
        
        const firstErrorKey = Object.keys(validationResult.errors)[0];
        toast.error(validationResult.errors[firstErrorKey]);
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
  
    const formattedData = formatFormDataForValidation(formData);
    const validationResult = validateEmployeeForm(formattedData);
    
    if (!validationResult.success) {
      setErrors(validationResult.errors);
      logDebug('Form submission errors:', validationResult.errors);
      toast.error('Please fix all errors before submitting');
      setIsSubmitting(false);
      return;
    }
  
    try {
      const submissionData = {
        name: formData.name?.trim() || '',
        email: formData.email?.trim() || '',
        gender: formData.gender || '',
        userId: formData.userId?.trim() || '',
        phone: formData.phone?.trim() || '',
        alternativePhone: formData.alternativePhone?.trim() || '',
        address: formData.address?.trim() || '',
        landmark: formData.landmark?.trim() || '',
        lat: formData.latitude || "",
        lng: formData.longitude || "",
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
        roleId: formData.roleId ? parseInt(formData.roleId, 10) : null,
        additionalInfo: {
          bloodGroup: formData.bloodGroup?.trim() || '',
          emergencyPhone: formData.emergencyPhone?.trim() || '',
          emergencyContact: formData.emergencyContact?.trim() || '',
        }
      };

      if (formData.specialNeed === 'none') {
        submissionData.specialNeed = null;
        submissionData.specialNeedStart = null;
        submissionData.specialNeedEnd = null;
      } else {
        submissionData.specialNeed = formData.specialNeed;
        
        if (formData.specialNeedStart) {
          submissionData.specialNeedStart = formData.specialNeedStart;
        } else if (dateRangeSelection[0]?.startDate) {
          submissionData.specialNeedStart = dateRangeSelection[0].startDate.toISOString().split('T')[0];
        }
        
        if (formData.specialNeedEnd) {
          submissionData.specialNeedEnd = formData.specialNeedEnd;
        } else if (dateRangeSelection[0]?.endDate) {
          submissionData.specialNeedEnd = dateRangeSelection[0].endDate.toISOString().split('T')[0];
        }
      }
  
      Object.keys(submissionData.additionalInfo).forEach(key => {
        if (submissionData.additionalInfo[key] === '') {
          delete submissionData.additionalInfo[key];
        }
      });

      if (Object.keys(submissionData.additionalInfo).length === 0) {
        delete submissionData.additionalInfo;
      }
  
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === undefined || submissionData[key] === '') {
          delete submissionData[key];
        }
      });
  
      logDebug('Submission data:', submissionData);

      const response = mode === 'create'
        ? await API_CLIENT.post('employees/', submissionData)
        : await API_CLIENT.put(`/employees/${userId}`, submissionData);
  
      if (response.status >= 200 && response.status < 300) {
        toast.success(`Employee ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        if (mode === 'create') {
          setFormData(initialFormData);
          setCurrentStep('personalInfo');
          setCompletedSteps([]);
          setDateRangeSelection([{ startDate: null, endDate: null, key: "selection" }]);
        }
      } else {
        toast.error(response.data?.detail || `Failed to ${mode === 'create' ? 'create' : 'update'} employee`);
      }
  
    } catch (error) {
      logError('Submission error:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.message}`)
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(
          error.response?.data?.message ||
          error.message ||
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
              onSubmit={() => navigate(-1)}
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