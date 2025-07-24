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

  // File fields and their names
  bgvDocument: null,
  bgvDocumentName: '',
  policeDocument: null,
  policeDocumentName: '',
  medicalDocument: null,
  medicalDocumentName: '',
  trainingDocument: null,
  trainingDocumentName: '',
  eyeTestDocument: null,
  eyeTestDocumentName: '',
  licenseDocument: null,
  licenseDocumentName: '',
  inductionDocument: null,
  inductionDocumentName: '',
  badgeDocument: null,
  badgeDocumentName: '',
  govtIdDocument: null,
  govtIdDocumentName: '',
  profileImage: null,
};

const DriverForm = ({ initialData = null, isEdit = false, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const { [name]: removed, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleImageChange = (file) => {
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
      [`${name}Name`]: file.name,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === 'isSameAddress' && checked
        ? { currentAddress: prev.permanentAddress }
        : {}),
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
    setTabErrors((prev) => ({
      ...prev,
      personalDetails: Object.keys(newErrors).length > 0,
    }));
    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = () => {
    const newErrors = {};
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';

    setErrors(newErrors);
    setTabErrors((prev) => ({
      ...prev,
      documents: Object.keys(newErrors).length > 0,
    }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === 'personalDetails' && validatePersonalDetails()) {
      setActiveTab('documents');
    }
  };

  const handleBack = () => {
    if (activeTab === 'documents') setActiveTab('personalDetails');
  };

  const mapToAPIPayload = () => {
    const payload = new FormData();
    payload.append('driver_code', formData.driverId);
    payload.append('name', formData.driverName);
    payload.append('email', 'driver@example.com');
    payload.append('hashed_password', 'Pass@123');
    payload.append('mobile_number', formData.mobileNumber);
    payload.append('city', formData.city);
    payload.append('date_of_birth', formData.dateOfBirth);
    payload.append('gender', formData.gender);
    payload.append('alternate_mobile_number', formData.alternateMobileNumber);
    payload.append('permanent_address', formData.permanentAddress);
    payload.append('current_address', formData.currentAddress);
    payload.append('bgv_status', formData.bgvStatus);
    payload.append('bgv_date', formData.bgvExpiryDate);
    payload.append('police_verification_status', formData.policeVerification);
    payload.append('police_verification_date', formData.policeExpiryDate);
    payload.append('medical_verification_status', formData.medicalVerification);
    payload.append('medical_verification_date', formData.medicalExpiryDate);
    payload.append('training_verification_status', formData.trainingVerification);
    payload.append('training_verification_date', formData.trainingExpiryDate);
    payload.append('eye_test_verification_status', 'pending');
    payload.append('eye_test_verification_date', formData.eyeTestExpiryDate);
    payload.append('license_number', formData.licenseNumber);
    payload.append('license_expiry_date', formData.licenseExpiryDate);
    payload.append('induction_date', formData.inductionDate);
    payload.append('badge_number', formData.badgeNumber);
    payload.append('badge_expiry_date', formData.badgeExpiryDate);
    payload.append('alternate_govt_id', formData.alternateGovtId);
    payload.append('govt_id_number', formData.govtIdNumber);
    payload.append('alternate_govt_id_doc_type', 'aadhaar');

    const fileFields = {
      photo_image: formData.profileImage,
      bgv_doc_file: formData.bgvDocument,
      police_verification_doc_file: formData.policeDocument,
      medical_verification_doc_file: formData.medicalDocument,
      training_verification_doc_file: formData.trainingDocument,
      eye_test_verification_doc_file: formData.eyeTestDocument,
      license_doc_file: formData.licenseDocument,
      induction_doc_file: formData.inductionDocument,
      badge_doc_file: formData.badgeDocument,
      alternate_govt_id_doc_file: formData.govtIdDocument,
    };

    Object.entries(fileFields).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    return payload;
  };

  const handleSave = () => {
    const personalValid = validatePersonalDetails();
    const docValid = validateDocuments();
    if (personalValid && docValid) {
      const payload = mapToAPIPayload();
      if (typeof onSave === 'function') {
        onSave(payload);
      } else {
        console.error('onSave prop is not a function!');
      }
      alert(isEdit ? 'Driver updated successfully!' : 'Driver added successfully!');
      if (onClose) onClose();
    } else if (!personalValid) {
      setActiveTab('personalDetails');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <HeaderWithActionNoRoute
        title={isEdit ? 'Edit Driver' : 'Add New Driver'}
        showBackButton
        onBack={onClose}
      />

      <div className="bg-white max-h-[600px] rounded-lg overflow-y-auto">
        <DriverTabNavigation
          activeTab={activeTab}
          errors={tabErrors}
          onTabChange={setActiveTab}
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
                onClick={handleSave}
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
