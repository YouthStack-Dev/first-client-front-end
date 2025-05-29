import React, { useState } from 'react';
import DriverTabNavigation from './DriverTabNavigation';
import PersonalDetailsTab from './PersonalDetailsTab';
import DocumentsTab from './DocumentsTab';
import { UserCircle } from 'lucide-react';
import HeaderWithActionNoRoute from './HeaderWithActionNoRoute';

const initialFormData = {
  // Personal Details
  driverName: '',
  dateOfBirth: '',
  mobileNumber: '',
  driverId: '',
  permanentAddress: '',
  currentAddress: '',
  isSameAddress: false,
  alternateMobileNumber: '',
  city: '',
  vendor: '',
  gender: 'male',

  // Documents
  bgvStatus: 'pending',
  policeVerification: 'pending',
  medicalVerification: 'pending',
  trainingVerification: 'pending',

  // Document Dates
  bgvExpiryDate: '',
  policeExpiryDate: '',
  medicalExpiryDate: '',
  trainingExpiryDate: '',
  eyeTestExpiryDate: '',

  // Additional Documents
  licenseNumber: '',
  licenseExpiryDate: '',
  inductionDate: '',
  badgeNumber: '',
  badgeExpiryDate: '',
  alternateGovtId: '',
  govtIdNumber: '',
};

const DriverForm = () => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === 'isSameAddress' && checked ? { currentAddress: prev.permanentAddress } : {}),
    }));
  };

  const validatePersonalDetails = () => {
    const newErrors = {};

    if (!formData.driverName) newErrors.driverName = 'Driver name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    setTabErrors((prev) => ({ ...prev, personalDetails: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = () => {
    const newErrors = {};

    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';

    setErrors(newErrors);
    setTabErrors((prev) => ({ ...prev, documents: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === 'personalDetails') {
      const isValid = validatePersonalDetails();
      if (isValid) setActiveTab('documents');
    }
  };

  const handleBack = () => {
    if (activeTab === 'documents') {
      setActiveTab('personalDetails');
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'documents') {
      const isValid = validateDocuments();
      if (isValid) {
        const isPersonalDetailsValid = validatePersonalDetails();

        if (isPersonalDetailsValid && isValid) {
          console.log('Form submitted:', formData);
          alert('Form submitted successfully!');
        } else {
          if (!isPersonalDetailsValid) {
            setActiveTab('personalDetails');
          }
        }
      }
    }
  };

  return (
    <div className="max-w-7xl  mx-auto p-4">
     
     <HeaderWithActionNoRoute
            title="Add New Driver "
           
            showBackButton={true}
            // or any custom handler
          />
      <div className="bg-white max-h-[600px] rounded-lg overflow-y-auto">
        <DriverTabNavigation
          activeTab={activeTab}
          errors={tabErrors}
          onTabChange={handleTabChange}
        />

        <div className="p-4">
          {activeTab === 'personalDetails' && (
            <PersonalDetailsTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onImageChange={handleImageChange}
              onCheckboxChange={handleCheckboxChange}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onFileChange={handleFileChange}
            />
          )}

          <div className="flex justify-between mt-6">
            {activeTab !== 'personalDetails' && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                Back
              </button>
            )}
            {activeTab !== 'documents' ? (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;
