import React, { useEffect, useState } from 'react';
import DriverTabNavigation from './DriverTabNavigation';
import DriverPersonalDetails from './DriverPersonalDetails';
import DocumentsTab from './DocumentsTab';
import { logDebug } from '../../utils/logger';
import { API_CLIENT } from '../../Api/API_Client';
import { fieldMapping, transformBackendToFormData } from './driverUtility';
import { toast } from 'react-toastify';

const defaultFormData = {
  name: '', dateOfBirth: '', mobileNumber: '', driver_code: '',
  permanentAddress: '', currentAddress: '', isSameAddress: false,
  alternateMobileNumber: '', city: '', vendorId: '', email: '', password: '',
  gender: 'male', bgvStatus: 'pending', policeVerification: 'pending',
  medicalVerification: 'pending', trainingVerification: 'pending', eyeTestStatus: 'pending',
  bgvExpiryDate: '', policeExpiryDate: '', medicalExpiryDate: '', trainingExpiryDate: '',
  eyeTestExpiryDate: '', licenseNumber: '', licenseExpiryDate: '', inductionDate: '',
  badgeNumber: '', badgeExpiryDate: '', alternateGovtId: '', govtIdNumber: '',
  bgvDocument: null, policeDocument: null, medicalDocument: null, trainingDocument: null,
  eyeTestDocument: null, licenseDocument: null, inductionDocument: null,
  badgeDocument: null, govtIdDocument: null, profileImage: null,
};

const tabs = ["personalDetails", "documents"];

const DriverForm = ({ initialData = null, mode, onClose, vendors = [] }) => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      const transformedData = transformBackendToFormData(initialData);
      setFormData(prev => ({
        ...prev,
        ...transformedData,
        vendorId: initialData.vendor?.vendor_id || '',
      }));
    }
  }, [initialData, mode]);

  // --- Handlers ---
  const handleChange = e => {
    if (mode === 'view') return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (name, file) => {
    if (mode === 'view') return;
    setFormData(prev => ({ ...prev, [name]: file }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = file => {
    if (mode === 'view') return;
    setFormData(prev => ({ ...prev, profileImage: file }));
  };

  const handleCheckboxChange = (name, checked) => {
    if (mode === 'view') return;
    setFormData(prev => {
      const newData = { ...prev, [name]: checked };
      if (name === 'isSameAddress' && checked) newData.currentAddress = prev.permanentAddress;
      return newData;
    });
  };

  // --- Validations ---
  const validatePersonalDetails = () => {
    const personalErrors = {};
    if (!formData.name?.trim()) personalErrors.name = 'Driver name is required';
    if (!formData.city?.trim()) personalErrors.city = 'City is required';
    if (!formData.dateOfBirth) personalErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.mobileNumber?.trim()) personalErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNumber)) personalErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    if (formData.alternateMobileNumber?.trim()) {
      if (!/^\d{10}$/.test(formData.alternateMobileNumber)) personalErrors.alternateMobileNumber = 'Alternate number must be exactly 10 digits';
      else if (formData.alternateMobileNumber === formData.mobileNumber) personalErrors.alternateMobileNumber = 'Alternate number cannot be same as Mobile number';
    }
    if (!formData.email?.trim()) personalErrors.email = 'Email is required';
    if (!formData.password?.trim() && mode !== 'edit') personalErrors.password = 'Password is required';
    if (!formData.vendorId) personalErrors.vendorId = 'Vendor selection is required';
    if (!formData.driver_code?.trim()) personalErrors.driver_code = 'Driver code is required';
    if (!formData.gender) personalErrors.gender = 'Gender is required';
    return personalErrors;
  };

  const validateDocuments = () => {
    const docErrors = {};
    const today = new Date();
    const requiredDocs = [
      'bgvDocument', 'policeDocument', 'medicalDocument',
      'trainingDocument', 'eyeTestDocument', 'licenseDocument',
      'govtIdDocument', 'inductionDocument', 'badgeDocument',
    ];
    requiredDocs.forEach(doc => {
      if (!formData[doc]) docErrors[doc] = 'This document is required';
    });
    if (!formData.licenseNumber?.trim()) docErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) docErrors.licenseExpiryDate = 'License expiry date is required';
    else if (new Date(formData.licenseExpiryDate) < today) docErrors.licenseExpiryDate = 'License expiry date cannot be in the past';
    const expiryFields = [
      { key: 'bgvExpiryDate', label: 'BGV expiry date' },
      { key: 'policeExpiryDate', label: 'Police verification expiry date' },
      { key: 'medicalExpiryDate', label: 'Medical expiry date' },
      { key: 'trainingExpiryDate', label: 'Training expiry date' },
      { key: 'eyeTestExpiryDate', label: 'Eye test expiry date' },
      { key: 'badgeExpiryDate', label: 'Badge expiry date' },
    ];
    expiryFields.forEach(({ key, label }) => {
      if (!formData[key]) docErrors[key] = `${label} is required`;
      else if (new Date(formData[key]) < today) docErrors[key] = `${label} cannot be in the past`;
    });
    if (!formData.badgeNumber?.trim()) docErrors.badgeNumber = 'Badge number is required';
    if (!formData.alternateGovtId?.trim()) docErrors.alternateGovtId = 'Alternate Government ID is required';
    if (!formData.govtIdNumber?.trim()) docErrors.govtIdNumber = 'Government ID number is required';
    return docErrors;
  };

  // --- Tab navigation ---
const handleNext = () => {
  let currentErrors = {};
  if (activeTab === 'personalDetails') currentErrors = validatePersonalDetails();
  else if (activeTab === 'documents') currentErrors = validateDocuments();

  if (Object.keys(currentErrors).length > 0) {
    setErrors(prev => ({ ...prev, ...currentErrors }));
    toast.error("Please fix errors before proceeding");
    return; // ❌ Stop tab switch if errors exist
  }

  const currentIndex = tabs.indexOf(activeTab);
  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
};


  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all tabs before final submit
    const personalErrors = validatePersonalDetails();
    const documentErrors = validateDocuments();
    const allErrors = { ...personalErrors, ...documentErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error("Please fix errors before submitting");
      setActiveTab(Object.keys(personalErrors).length > 0 ? "personalDetails" : "documents");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          const backendKey = fieldMapping[key] || key;
          if (formData[key] instanceof File) formDataToSubmit.append(backendKey, formData[key]);
          else if (formData[key] instanceof Date) formDataToSubmit.append(backendKey, formData[key].toISOString());
          else if (typeof formData[key] === "boolean") formDataToSubmit.append(backendKey, formData[key] ? "true" : "false");
          else formDataToSubmit.append(backendKey, formData[key]);
        }
      });

      const vendorId = formData.vendorId || initialData?.vendor?.vendor_id;
      let response;
      if (mode === "edit") {
        response = await API_CLIENT.put(`/vendors/${vendorId}/drivers/${initialData.driver_id}`, formDataToSubmit);
        toast.success("Driver updated successfully!");
      } else {
        response = await API_CLIENT.post(`/vendors/${vendorId}/drivers/`, formDataToSubmit);
        toast.success("Driver created successfully!");
      }

      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render tab content ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personalDetails':
        return <DriverPersonalDetails
          formData={formData} errors={errors} onChange={handleChange}
          onImageChange={handleImageChange} onCheckboxChange={handleCheckboxChange}
          vendors={vendors} loading={isSubmitting} mode={mode}
        />;
      case 'documents':
        return <DocumentsTab
          formData={formData} errors={errors} onChange={handleChange} onFileChange={handleFileChange}
          mode={mode === 'edit' ? 'edit' : 'create'}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">

        {/* Tab Navigation */}
        <DriverTabNavigation
          activeTab={activeTab}
          errors={{
            personalDetails: Object.keys(errors).some(key =>
              ['name','dateOfBirth','mobileNumber','alternateMobileNumber','email','password','vendorId','driver_code','gender','city'].includes(key)
            ),
            documents: Object.keys(errors).some(key =>
              ['bgvDocument','policeDocument','medicalDocument','trainingDocument','eyeTestDocument','licenseDocument','govtIdDocument','inductionDocument','badgeDocument','licenseNumber','licenseExpiryDate','bgvExpiryDate','policeExpiryDate','medicalExpiryDate','trainingExpiryDate','eyeTestExpiryDate','badgeExpiryDate','badgeNumber','alternateGovtId','govtIdNumber'].includes(key)
            ),
          }}
          onTabChange={setActiveTab}
          validateTab={tabId => {
            if (tabId === 'personalDetails') return validatePersonalDetails();
            if (tabId === 'documents') return validateDocuments();
            return {};
          }}
        />


        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">{renderTabContent()}</div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
            {activeTab !== "personalDetails" && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}

            <div className="flex space-x-3 ml-auto">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}

              {activeTab !== "documents" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Saving..." : mode === "edit" ? "Update Driver" : "Create Driver"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;
