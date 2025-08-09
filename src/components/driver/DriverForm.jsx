import React, { useEffect, useState } from 'react';
import { useDispatch  } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import DriverTabNavigation from './DriverTabNavigation';
import PersonalDetailsTab from '../PersonalDetailsTab';
import DocumentsTab from './DocumentsTab';
import HeaderWithActionNoRoute from '../HeaderWithActionNoRoute';

import { createDriverThunk, updateDriverThunk } from '../../redux/features/manageDriver/driverThunks';

const defaultFormData = {
  driverName: '', dateOfBirth: '', mobileNumber: '', driverId: '',
  permanentAddress: '', currentAddress: '', isSameAddress: false,
  alternateMobileNumber: '', city: '', vendor: '', email: '', password: '',
  gender: 'male', bgvStatus: 'pending', policeVerification: 'pending',
  medicalVerification: 'pending', trainingVerification: 'pending', eyeTestStatus: 'pending',
  bgvExpiryDate: '', policeExpiryDate: '', medicalExpiryDate: '', trainingExpiryDate: '',
  eyeTestExpiryDate: '', licenseNumber: '', licenseExpiryDate: '', inductionDate: '',
  badgeNumber: '', badgeExpiryDate: '', alternateGovtId: '', govtIdNumber: '',
  bgvDocument: null, policeDocument: null, medicalDocument: null, trainingDocument: null,
  eyeTestDocument: null, licenseDocument: null, inductionDocument: null,
  badgeDocument: null, govtIdDocument: null, profileImage: null,
};

const DriverForm = ({ initialData = null, isEdit = false, onClose, vendors = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [documentError, setDocumentError] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalValid, setPersonalValid] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initializeFormData(initialData));
  }, [initialData]);

  const initializeFormData = (data) => ({
    ...defaultFormData,
    driverName: data.name || '', dateOfBirth: data.date_of_birth || '',
    mobileNumber: data.mobile_number || '', driverId: data.driver_code || '',
    permanentAddress: data.permanent_address || '', currentAddress: data.current_address || '',
    alternateMobileNumber: data.alternate_mobile_number || '', city: data.city || '',
    vendor: data.vendor?.vendor_id || '', email: data.email || '', gender: data.gender || 'male',
    bgvStatus: data.bgv_status || 'pending', policeVerification: data.police_verification_status || 'pending',
    medicalVerification: data.medical_verification_status || 'pending', trainingVerification: data.training_verification_status || 'pending',
    bgvExpiryDate: data.bgv_date || '', policeExpiryDate: data.police_verification_date || '',
    medicalExpiryDate: data.medical_verification_date || '', trainingExpiryDate: data.training_verification_date || '',
    eyeTestExpiryDate: data.eye_test_verification_date || '', licenseNumber: data.license_number || '',
    licenseExpiryDate: data.license_expiry_date || '', inductionDate: data.induction_date || '',
    badgeNumber: data.badge_number || '', badgeExpiryDate: data.badge_expiry_date || '',
    alternateGovtId: data.alternate_govt_id || '', govtIdNumber: data.govt_id_number || '',
    bgvDocumentName: data.bgv_doc_url?.split('/').pop() || '',
    policeDocumentName: data.police_verification_doc_url?.split('/').pop() || '',
    medicalDocumentName: data.medical_verification_doc_url?.split('/').pop() || '',
    trainingDocumentName: data.training_verification_doc_url?.split('/').pop() || '',
    eyeTestDocumentName: data.eye_test_verification_doc_url?.split('/').pop() || '',
    licenseDocumentName: data.license_doc_url?.split('/').pop() || '',
    inductionDocumentName: data.induction_doc_url?.split('/').pop() || '',
    badgeDocumentName: data.badge_doc_url?.split('/').pop() || '',
    govtIdDocumentName: data.alternate_govt_id_doc_url?.split('/').pop() || '',

    bgvDocument: data.bgv_doc_url || null,
policeDocument: data.police_verification_doc_url || null,
medicalDocument: data.medical_verification_doc_url || null,
trainingDocument: data.training_verification_doc_url || null,
eyeTestDocument: data.eye_test_verification_doc_url || null,
licenseDocument: data.license_doc_url || null,
inductionDocument: data.induction_doc_url || null,
badgeDocument: data.badge_doc_url || null,
govtIdDocument: data.alternate_govt_id_doc_url || null,

  });

  const getFieldMap = () => ({
    driver_code: formData.driverId,
    name: formData.driverName,
    email: formData.email,
    hashed_password: formData.password,
    mobile_number: formData.mobileNumber,
    city: formData.city,
    date_of_birth: formData.dateOfBirth,
    gender: formData.gender,
    alternate_mobile_number: formData.alternateMobileNumber,
    permanent_address: formData.permanentAddress,
    current_address: formData.currentAddress,
    bgv_status: formData.bgvStatus,
    bgv_date: formData.bgvExpiryDate,
    police_verification_status: formData.policeVerification,
    police_verification_date: formData.policeExpiryDate,
    medical_verification_status: formData.medicalVerification,
    medical_verification_date: formData.medicalExpiryDate,
    training_verification_status: formData.trainingVerification,
    training_verification_date: formData.trainingExpiryDate,
    eye_test_verification_status: formData.eyeTestStatus,
    eye_test_verification_date: formData.eyeTestExpiryDate,
    license_number: formData.licenseNumber,
    license_expiry_date: formData.licenseExpiryDate,
    induction_date: formData.inductionDate,
    badge_number: formData.badgeNumber,
    badge_expiry_date: formData.badgeExpiryDate,
    alternate_govt_id: formData.alternateGovtId,
    govt_id_number: formData.govtIdNumber,
    alternate_govt_id_doc_type: formData.alternateGovtIdDocType,
  });

  const getFileMap = () => ({
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
  });

 const handleInputChange = ({ target: { name, value } }) => {
  setFormData((prev) => ({ ...prev, [name]: value }));


  if (name === 'dateOfBirth') {
    const dob = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
    const actualAge = isBeforeBirthday ? age - 1 : age;

    if (actualAge < 18) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: 'Driver must be at least 18 years old',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.dateOfBirth;
        return newErrors;
      });
    }
  }

  if (name === 'mobileNumber') {
    if (!/^\d{10}$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: 'Enter a valid 10-digit mobile number',
      }));
    } else if (formData.alternateMobileNumber === value) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: 'Mobile number must be different from alternate number',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.mobileNumber;
        return newErrors;
      });
    }
  }

  if (name === 'alternateMobileNumber') {
    if (!/^\d{10}$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        alternateMobileNumber: 'Enter a valid 10-digit alternate number',
      }));
    } else if (formData.mobileNumber === value) {
      setErrors((prev) => ({
        ...prev,
        alternateMobileNumber: 'Alternate number must be different from mobile number',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.alternateMobileNumber;
        return newErrors;
      });
    }
  }
  if (!['dateOfBirth', 'mobileNumber', 'alternateMobileNumber'].includes(name)) {
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }
};


  const handleImageChange = (file) => {
    if (file) setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const handleFileChange = (name, file) => {
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file, [`${name}Name`]: file.name }));
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === 'isSameAddress' && checked ? { currentAddress: prev.permanentAddress } : {}),
    }));
  };

    const validatePersonalDetails = () => {
      const errors = {};
      const requiredFields = [
        'driverName',
        'dateOfBirth',
        'mobileNumber',
        'city',
        'vendor',
        'gender',
        'email',
      ];

      requiredFields.forEach((field) => {
        if (!formData[field] || formData[field].toString().trim() === '') {
          errors[field] = `${field} is required`;
        }
      });

      if (formData.mobileNumber) {
        const mobile = formData.mobileNumber.trim();
        if (!/^\d{10}$/.test(mobile)) {
          errors.mobileNumber = 'Enter a valid 10-digit mobile number';
        }
      }

      if (formData.alternateMobileNumber) {
        const altMobile = formData.alternateMobileNumber.trim();
        if (!/^\d{10}$/.test(altMobile)) {
          errors.alternateMobileNumber = 'Enter a valid 10-digit alternate number';
        } else if (altMobile === formData.mobileNumber) {
          errors.alternateMobileNumber = 'Alternate number must be different from mobile number';
        }
      }
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Enter a valid email address';
      }

      if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const isBeforeBirthday =
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
        if (isBeforeBirthday) age--;

        if (age < 18) {
          errors.dateOfBirth = 'Driver must be at least 18 years old';
        }
      }

      setErrors(errors);
      setTabErrors((prev) => ({
        ...prev,
        personalDetails: Object.keys(errors).length > 0,
      }));

      return Object.keys(errors).length === 0;
    };

const validateDocuments = () => {
  const errors = {};
  const docFields = [
    ["bgvDocument", "bgvDocumentName", "BGV"],
    ["policeDocument", "policeDocumentName", "Police Verification"],
    ["medicalDocument", "medicalDocumentName", "Medical"],
    ["trainingDocument", "trainingDocumentName", "Training Certificate"],
    ["eyeTestDocument", "eyeTestDocumentName", "Eye Test"],
    ["licenseDocument", "licenseDocumentName", "Driving License"],
    ["inductionDocument", "inductionDocumentName", "Induction Certificate"],
    ["badgeDocument", "badgeDocumentName", "Badge"],
    ["govtIdDocument", "govtIdDocumentName", "Government ID"],
  ];

  docFields.forEach(([field, nameField, label]) => {
    const hasUploadedFile = !!formData[field];
    const hasExistingUrl = !!formData[nameField];
    if (!hasUploadedFile && !hasExistingUrl) {
      errors[field] = `${label} document is required`;
    }
  });

  setDocumentError(errors);
  return Object.keys(errors).length === 0;
};


  const mapToFormData = () => {
    const form = new FormData();
    const fieldMap = getFieldMap();
    const fileMap = getFileMap();

    Object.entries(fieldMap).forEach(([key, val]) => form.append(key, val || ''));
    Object.entries(fileMap).forEach(([key, file]) => { if (file) form.append(key, file); });
    return { vendorId: formData.vendor || vendors[0]?.vendor_id || '', payload: form };
  };

  const handleSave = async () => {
  const isPersonalValid = validatePersonalDetails();
  const isDocumentValid = validateDocuments();

  if (!isPersonalValid || !isDocumentValid) {
    console.warn('[VALIDATION FAILED] Personal or document validation failed.');
    return;
  }

  const { vendorId, payload } = mapToFormData();
  setIsSubmitting(true);

  try {
    if (isEdit) {
      await dispatch(updateDriverThunk({
        vendor_id: vendorId,
        driver_id: initialData?.driver_id,
        formData: payload,
      })).unwrap();
      toast.success('Driver updated successfully');
    } else {
      await dispatch(createDriverThunk({
        vendor_id: vendorId,
        formData: payload,
      })).unwrap();
      toast.success('Driver created successfully');
    }
    onClose?.();
  } catch (error) {
    console.error('[SAVE FAILED]', error);
    toast.error('Something went wrong while saving the driver.');
  } finally {
    setIsSubmitting(false);
  }
};



  const handleNext = () => {
    const valid = validatePersonalDetails();
    setPersonalValid(valid);
    if (valid) setActiveTab('documents');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <HeaderWithActionNoRoute
        title={isEdit ? 'Edit Driver' : 'Add New Driver'}
        showBackButton
        onBack={onClose} />

      <div className="bg-white max-h-[600px] rounded-lg overflow-y-auto">
        <DriverTabNavigation activeTab={activeTab} errors={tabErrors} onTabChange={setActiveTab} />

        <div className="p-4">
          {activeTab === 'personalDetails' && (
            <PersonalDetailsTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onImageChange={handleImageChange}
              onCheckboxChange={handleCheckboxChange}
              vendors={vendors}  />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onFileChange={handleFileChange}  />
          )}

          <div className="flex justify-between mt-6">
            {activeTab !== 'personalDetails' && (
              <button onClick={() => setActiveTab('personalDetails')} className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                Back
              </button>
            )}

            <button
              onClick={activeTab !== 'documents' ? handleNext : handleSave}
              disabled={isSubmitting}
              className={`ml-auto px-6 py-2 rounded-md transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {activeTab !== 'documents' ? 'Next' : isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;
