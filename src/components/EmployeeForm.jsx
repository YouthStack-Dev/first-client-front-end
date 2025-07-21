import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import FormSteps from './FormSteps';
import PersonalInfoForm from './PersonalInfoForm';
import NavigationButtons from './NavigationButtons';
import HeaderWithAction from './HeaderWithAction';
import EmployeeAddressGoogleMapView from './Map';
import { createEmployee, updateEmployee } from '../redux/features/manageTeam/manageTeamThunks';
import { useDispatch, useSelector } from 'react-redux';
import { log } from '../utils/logger';
import { toast, ToastContainer } from 'react-toastify';

const initialFormData = {
  employeeName: '',
  employee_code: '',
  emailId: '',
  gender: '',
  mobileNumber: '',
  alternate_mobile_number: '',
  office: '',
  specialNeed: 'None',
  dateRange: {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  address: '',
  landmark: '',
  latitude: '',
  longitude: '',
  distance_from_company: '',
};

const EmployeeForm = ({ mode = 'create' }) => {
  const { employeeId } = useParams();
  const { state } = useLocation();
  
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState('personalInfo');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== 'create');
  const dispatch = useDispatch(); // Initialize useDispatch
  const { status, error } = useSelector(
    (state) => state.manageTeam.apiStatus.createEmployee
  );

  console.log(" this is the error in  employe form" ,error);
  
  
  // Load employee data for edit/view modes
  useEffect(() => {
    if (mode === 'create') {
      setIsLoading(false);
      return;
    }

    const loadEmployeeData = () => {
      setIsLoading(true);
      try {
        // First try to get from route state
        const employee = state?.employee;
        console.log('Employee from route state:', employee);

        if (employee) {
          const mappedData = {
            ...initialFormData,
            // Map all fields from the employee object to form fields
            employeeName: employee.username || employee.employeeName || '',
            employee_code: employee.employee_code || '',
            emailId: employee.email || employee.emailId || '',
            gender: employee.gender || '',
            mobileNumber: employee.mobile_number || employee.mobileNumber || '',
            alternate_mobile_number: employee.alternate_mobile_number || '',
            office: employee.office || '',
            specialNeed: employee.specialNeed || 'None',
            department:1,
            dateRange: employee.dateRange || {
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            },
            address: employee.address || '',
            landmark: employee.landmark || '',
            latitude: employee.latitude || '',
            longitude: employee.longitude || '',
            distance_from_company: employee.distance_from_company || '',
          };
          setFormData(mappedData);
        } else {
          console.error(`Employee data not found in route state for ID ${employeeId}`);
        }
      } catch (error) {
        console.error('Error loading employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployeeData();
  }, [mode, employeeId, state]);

  const handleInputChange = (e) => {
    if (mode === 'view') return;
    
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name, checked) => {
    if (mode === 'view') return;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validatePersonalInfo = () => {
    const newErrors = {};
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!formData.employee_code.trim()) newErrors.employee_code = 'Employee ID is required';
    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = 'Enter a valid email';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    // if (!formData.office) newErrors.office = 'Office is required';
    if (formData.alternate_mobile_number && formData.mobileNumber === formData.alternate_mobile_number) {
      newErrors.alternate_mobile_number = 'Alternate mobile number must be different';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 'personalInfo') {
      const isValid = validatePersonalInfo();
      if (isValid) {
        setCurrentStep('address');
        if (!completedSteps.includes('personalInfo')) {
          setCompletedSteps((prev) => [...prev, 'personalInfo']);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'address') {
      setCurrentStep('personalInfo');
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') {
      window.history.back();
      return;
    }
  
    let isValid = true;
    if (currentStep === 'address') {
      isValid = validateAddress();
    } else {
      isValid = validatePersonalInfo();
    }
  
    if (!isValid) return;
  
    setIsSubmitting(true);
  
    const payload = {
      employee_code: formData.employee_code,
      gender: formData.gender,
      mobile_number: formData.mobileNumber,
      alternate_mobile_number: formData.alternate_mobile_number,
      office: formData.office || "SEF OFFICE",
      special_need: formData.specialNeed,
      email: formData.emailId,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      landmark: formData.landmark,
      department_id: Number(formData.department),
      subscribe_via_email: formData.subscribeViaEmail ?? false,
      subscribe_via_sms: formData.subscribeViaSms ?? false,
      username: formData.employeeName,
      hashed_password: formData.employee_code, // Consider improving password generation
      ...(formData.employeeName && { employee_name: formData.employeeName }),
      ...(formData.dateRange && {
        start_date: formData.dateRange.startDate,
        end_date: formData.dateRange.endDate,
      }),
      ...(formData.distance_from_company && {
        distance_from_company: formData.distance_from_company,
      }),
    };
  
    console.log("this is the data submitted", payload);
  
    try {
      if (mode === 'create') {
        await dispatch(createEmployee(payload)).unwrap();
      } else {
        await dispatch(updateEmployee({ id: payload.employee_code, payload }
        )).unwrap();

      }
  
      toast.success(`✅ Employee ${mode === 'create' ? 'created' : 'updated'} successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
  
      if (mode === 'create') {
        setFormData(initialFormData);
        setCurrentStep('personalInfo');
        setCompletedSteps([]);
      }
    } catch (err) {
      const errorMessage = err?.detail || err?.message || 'Something went wrong';
      toast.error(`❌ Failed to ${mode === 'create' ? 'create' : 'update'} employee: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
      console.error(`Error during employee ${mode === 'create' ? 'creation' : 'update'}:`, err);
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
// In EmployeeForm.js, replace the current return statement with:
return (
  <>
  <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />

    <HeaderWithAction 
      title={mode === 'create' ? 'NEW EMPLOYEE' : mode === 'edit' ? 'EDIT EMPLOYEE' : 'EMPLOYEE DETAILS'} 
      showBackButton={true} 
    />
    <div className='p-2 m-3 bg-white rounded-xl'>
      {mode === 'view' ? (
        // View mode - show all information at once
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <PersonalInfoForm
              formData={formData}
              onChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              errors={errors}
              isReadOnly={true}
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
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded p-3 mt-3">
              📍 <strong>Note:</strong> The <code>CP</code> button shows company location.
            </div>
          </div>

          <NavigationButtons
            currentStep="complete"
            onSubmit={handleSubmit}
            isLastStep={true}
            mode={mode}
          />
        </>
      ) : (
        // Edit/Create mode - show stepped form
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
              />
            ) : (
              <>
                <EmployeeAddressGoogleMapView 
                  formData={formData} 
                  setFormData={setFormData}
                  setErrors={setErrors}
                  isReadOnly={false}
                />
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded p-3 mt-3">
                  📍 <strong>Note:</strong> The <code>CP</code> button shows company location.
                </div>
              </>
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