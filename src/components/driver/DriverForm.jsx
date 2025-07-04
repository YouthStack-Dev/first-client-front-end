import React, { useEffect, useState } from 'react';
import DriverTabNavigation from './DriverTabNavigation';
import PersonalDetailsTab from '../PersonalDetailsTab';
import DocumentsTab from './DocumentsTab';
import HeaderWithActionNoRoute from '../HeaderWithActionNoRoute';

const defaultFormData = {
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

  bgvStatus: 'pending',
  policeVerification: 'pending',
  medicalVerification: 'pending',
  trainingVerification: 'pending',

  bgvExpiryDate: '',
  policeExpiryDate: '',
  medicalExpiryDate: '',
  trainingExpiryDate: '',
  eyeTestExpiryDate: '',

  licenseNumber: '',
  licenseExpiryDate: '',
  inductionDate: '',
  badgeNumber: '',
  badgeExpiryDate: '',
  alternateGovtId: '',
  govtIdNumber: '',
};

const DriverForm = ({ initialData = null, isEdit = false, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      profileImage: file,
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
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
    setTabErrors(prev => ({ ...prev, personalDetails: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = () => {
    const newErrors = {};
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';

    setErrors(newErrors);
    setTabErrors(prev => ({ ...prev, documents: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === 'personalDetails') {
      const isValid = validatePersonalDetails();
      if (isValid) setActiveTab('documents');
    }
  };

  const handleBack = () => {
    if (activeTab === 'documents') setActiveTab('personalDetails');
  };

  const handleSubmit = () => {
    const docValid = validateDocuments();
    const personalValid = validatePersonalDetails();

    if (activeTab === 'documents') {
      if (docValid && personalValid) {
        if (onSubmit) onSubmit(formData);
        if (!isEdit) alert('Driver added successfully!');
        else alert('Driver updated successfully!');
        if (onClose) onClose();
      } else {
        if (!personalValid) setActiveTab('personalDetails');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <HeaderWithActionNoRoute
        title={isEdit ? 'Edit Driver' : 'Add New Driver'}
        showBackButton={true}
        onBack={onClose} // 👈 Ensures modal closes instead of navigating
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
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
              >
                Back
              </button>
            )}
            {activeTab !== 'documents' ? (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
