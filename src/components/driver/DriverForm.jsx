import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
  medicalVerification: 'pending', trainingVerification: 'pending',
  bgvExpiryDate: '', policeExpiryDate: '', medicalExpiryDate: '', trainingExpiryDate: '',
  eyeTestExpiryDate: '', licenseNumber: '', licenseExpiryDate: '', inductionDate: '',
  badgeNumber: '', badgeExpiryDate: '', alternateGovtId: '', govtIdNumber: '',
  bgvDocument: null, policeDocument: null, medicalDocument: null, trainingDocument: null,
  eyeTestDocument: null, licenseDocument: null, inductionDocument: null,
  badgeDocument: null, govtIdDocument: null, profileImage: null,
};

const DriverForm = ({ initialData = null, isEdit = false, onClose, vendors = [] }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
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
    eye_test_verification_status: 'pending',
    eye_test_verification_date: formData.eyeTestExpiryDate,
    license_number: formData.licenseNumber,
    license_expiry_date: formData.licenseExpiryDate,
    induction_date: formData.inductionDate,
    badge_number: formData.badgeNumber,
    badge_expiry_date: formData.badgeExpiryDate,
    alternate_govt_id: formData.alternateGovtId,
    govt_id_number: formData.govtIdNumber,
    alternate_govt_id_doc_type: 'aadhaar',
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
    if (errors[name]) setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
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
    const requiredFields = ['driverName', 'dateOfBirth', 'mobileNumber', 'city', 'vendor', 'gender'];
    const newErrors = requiredFields.reduce((acc, field) => {
      if (!formData[field]) acc[field] = 'This field is required';
      return acc;
    }, {});
    setErrors(newErrors);
    setTabErrors((prev) => ({ ...prev, personalDetails: !!Object.keys(newErrors).length }));
    return !Object.keys(newErrors).length;
  };

  const validateDocuments = () => {
    const docErrors = {};
    if (!formData.licenseNumber) docErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) docErrors.licenseExpiryDate = 'License expiry date is required';
    setErrors(docErrors);
    setTabErrors((prev) => ({ ...prev, documents: !!Object.keys(docErrors).length }));
    return !Object.keys(docErrors).length;
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
    if (!validatePersonalDetails()) return setActiveTab('personalDetails');
    if (!validateDocuments()) return setActiveTab('documents');

    setIsSubmitting(true);
    const { vendorId, payload } = mapToFormData();

    try {
      const thunk = isEdit
        ? updateDriverThunk({ vendor_id: vendorId, driver_id: initialData.driver_id, formData: payload })
        : createDriverThunk({ vendor_id: vendorId, formData: payload });

      const result = await dispatch(thunk);

      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(isEdit ? 'Driver updated successfully!' : 'Driver added successfully!');
        onClose?.();
        setFormData(defaultFormData);
      } else {
        toast.error(result.payload?.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Driver save failed', err);
      toast.error('Unexpected error occurred.');
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
        onBack={onClose}
      />

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
              vendors={vendors}
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
              <button onClick={() => setActiveTab('personalDetails')} className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                Back
              </button>
            )}

            <button
              onClick={activeTab !== 'documents' ? handleNext : handleSave}
              disabled={isSubmitting}
              className={`ml-auto px-6 py-2 rounded-md transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {activeTab !== 'documents' ? 'Next' : isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;
