import React, { useState } from 'react';
import FormSteps from './FormSteps';
import PersonalInfoForm from './PersonalInfoForm';
import AddressForm from './AddressForm';
import NavigationButtons from './NavigationButtons';
import HeaderWithAction from './HeaderWithAction';

const initialFormData = {
  employeeName: '',
  employeeId: '',
  emailId: '',
  gender: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  office: '',
  specialNeed: 'None',
  dateRange: '',
  transportUser: false,
  subscribeEmail: false,
  subscribeSms: false,
  mobileApp: false,
  address: '',
  geoCoordinates: '',
  landmark: '',
  nodalPoint: '',
  showAll: false,
};

const EmployeeForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState('personalInfo');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
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
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validatePersonalInfo = () => {
    const newErrors = {};
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = 'Enter a valid email';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.office) newErrors.office = 'Office is required';
    if (formData.alternateMobileNumber && formData.mobileNumber === formData.alternateMobileNumber) {
      newErrors.alternateMobileNumber = 'Alternate mobile number must be different';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = () => {
    // Add any address validation here if needed
    return true;
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

  const handleSubmit = () => {
    const isValid = validateAddress();
    if (!isValid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      alert('Employee registration successful!');
      setFormData(initialFormData);
      setCurrentStep('personalInfo');
      setCompletedSteps([]);
    }, 1500);
  };

  const isFirstStep = currentStep === 'personalInfo';
  const isLastStep = currentStep === 'address';

  return (
    <>
      <HeaderWithAction title="NEW EMPLOYEE" showBackButton={true} />
      <div className='p-2 m-3 bg-white rounded-xl max-h-[700px] overflow-auto'>
        <FormSteps currentStep={currentStep} completedSteps={completedSteps} />
        <div className="mt-6 m-3">
          {currentStep === 'personalInfo' && (
            <PersonalInfoForm
              formData={formData}
              onChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              errors={errors}
            />
          )}

          {currentStep === 'address' && (
            <AddressForm
              formData={formData}
              onChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {currentStep !== 'address' && (
          <NavigationButtons
            currentStep={currentStep}
            onBack={handleBack}
            onNext={handleNext}
            isLastStep={isLastStep}
            isFirstStep={isFirstStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};

export default EmployeeForm;
