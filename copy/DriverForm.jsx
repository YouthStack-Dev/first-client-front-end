import React, { useEffect, useState } from 'react';
import DriverTabNavigation from './DriverTabNavigation'; // Import the tab navigation
import DriverPersonalDetails from './DriverPersonalDetails'; // Import from your first document
import DocumentsTab from './DocumentsTab'; // Import from your second document
import { logDebug } from '../../utils/logger';
import { API_CLIENT } from '../../Api/API_Client';
import { fieldMapping, transformBackendToFormData,} from './driverUtility';
import { toast } from 'react-toastify';
import axios from 'axios';

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

const DriverForm = ({ initialData = null, mode, onClose, vendors = [] }) => {

  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Initialize form data if editing
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      const transformedData = transformBackendToFormData(initialData);
      const vendorId = initialData.vendor?.vendor_id; // safe access
  
      setFormData((prev) => ({
        ...prev,
        ...transformedData,
        vendorId: vendorId, // ✅ add vendorId properly
      }));
    }
  }, [initialData, mode]);
  
  

  // Handle form field changes
  const handleChange = (e) => {
if ( mode ==='view')  return
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (name, file) => {
    if ( mode ==='view')  return
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image upload for profile
  const handleImageChange = (file) => {
    if ( mode ==='view')  return
    setFormData(prev => ({
      ...prev,
      profileImage: file
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name, checked) => {
    if ( mode ==='view')  return
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: checked
      };
      
      // If "same as permanent address" is checked, copy permanent address
      if (name === 'isSameAddress' && checked) {
        newData.currentAddress = prev.permanentAddress;
      }
      
      return newData;
    });
  };

  // Validate personal details tab

 const validatePersonalDetails = () => {
    const personalErrors = {};
  
    if (!formData.name?.trim()) personalErrors.name = 'Driver name is required';
    if (!formData.city?.trim()) personalErrors.city = 'City is required';
    if (!formData.dateOfBirth) personalErrors.dateOfBirth = 'Date of birth is required';
    
    // Mobile number validation
    if (!formData.mobileNumber?.trim()) {
      personalErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      personalErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }
  
    // Alternate number validation
    if (formData.alternateNumber?.trim()) {
      if (!/^\d{10}$/.test(formData.alternateNumber)) {
        personalErrors.alternateNumber = 'Alternate number must be exactly 10 digits';
      } else if (formData.alternateNumber === formData.mobileNumber) {
        personalErrors.alternateNumber = 'Alternate number cannot be same as Mobile number';
      }
    }
  
    if (!formData.email?.trim()) personalErrors.email = 'Email is required';
    
    // Password check only when not in edit mode
    if (!formData.password?.trim() && mode !== 'edit') {
      personalErrors.password = 'Password is required';
    }
    
    if (!formData.vendorId) personalErrors.vendorId = 'Vendor selection is required';
    if (!formData.driver_code?.trim()) personalErrors.driver_code = 'Driver code is required';
    if (!formData.gender) personalErrors.gender = 'Gender is required';
  
    return personalErrors;
  };
  
  const validateDocuments = () => {
    const docErrors = {};
    const today = new Date();
  
    // Required document fields
    const requiredDocs = [
      'bgvDocument', 'policeDocument', 'medicalDocument',
      'trainingDocument', 'eyeTestDocument', 'licenseDocument',
      'govtIdDocument', 'inductionDocument', 'badgeDocument',
    ];
  
    requiredDocs.forEach((doc) => {
      if (!formData[doc]) {
        docErrors[doc] = 'This document is required';
      }
    });
  
    // License checks
    if (!formData.licenseNumber?.trim()) {
      docErrors.licenseNumber = 'License number is required';
    }
  
    if (!formData.licenseExpiryDate) {
      docErrors.licenseExpiryDate = 'License expiry date is required';
    } else {
      const licenseDate = new Date(formData.licenseExpiryDate);
      if (licenseDate < today) {
        docErrors.licenseExpiryDate = 'License expiry date cannot be in the past';
      }
    }
  
    // Expiry date validations for other docs
    const expiryFields = [
      { key: 'bgvExpiryDate', label: 'BGV expiry date' },
      { key: 'policeExpiryDate', label: 'Police verification expiry date' },
      { key: 'medicalExpiryDate', label: 'Medical expiry date' },
      { key: 'trainingExpiryDate', label: 'Training expiry date' },
      { key: 'eyeTestExpiryDate', label: 'Eye test expiry date' },
      { key: 'badgeExpiryDate', label: 'Badge expiry date' },
    ];
  
    expiryFields.forEach(({ key, label }) => {
      if (!formData[key]) {
        docErrors[key] = `${label} is required`;
      } else {
        const expDate = new Date(formData[key]);
        if (expDate < today) {
          docErrors[key] = `${label} cannot be in the past`;
        }
      }
    });
  
    // Extra required fields
    if (!formData.badgeNumber?.trim()) {
      docErrors.badgeNumber = 'Badge number is required';
    }
    if (!formData.alternateGovtId?.trim()) {
      docErrors.alternateGovtId = 'Alternate Government ID is required';
    }
    if (!formData.govtIdNumber?.trim()) {
      docErrors.govtIdNumber = 'Government ID number is required';
    }
  
    logDebug("Document validation errors:", docErrors);
    return docErrors;
  };
  

  // Handle tab change with validation
  const handleTabChange = (tabId) => {
    let currentTabErrors = {};
    
    // Validate current tab before switching
    if (activeTab === 'personalDetails') {
      currentTabErrors = validatePersonalDetails();
    } else if (activeTab === 'documents') {
      currentTabErrors = validateDocuments();
    }
    
  
    
    setErrors(currentTabErrors);
    setActiveTab(tabId);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // 🔹 1. Validate all tabs
    const personalErrors = validatePersonalDetails();
    const documentErrors = validateDocuments();
    const allErrors = { ...personalErrors, ...documentErrors };
    setTabErrors({
      personalDetails: Object.keys(personalErrors).length > 0,
      documents: Object.keys(documentErrors).length > 0,
    });
  
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setIsSubmitting(false);
  
      if (Object.keys(personalErrors).length > 0) {
        setActiveTab("personalDetails");
      } else if (Object.keys(documentErrors).length > 0) {
        setActiveTab("documents");
      }
  
      const firstErrorKey = Object.keys(allErrors)[0];
      const firstErrorMessage = allErrors[firstErrorKey];
  
      toast.error(`${firstErrorKey}: ${firstErrorMessage}`);
      return;
    }
  
    try {
      // 🔹 2. Prepare FormData
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          const backendKey = fieldMapping[key] || key;
  
          if (formData[key] instanceof File) {
            formDataToSubmit.append(backendKey, formData[key]);
          } else if (formData[key] instanceof Date) {
            formDataToSubmit.append(backendKey, formData[key].toISOString());
          } else if (typeof formData[key] === "boolean") {
            formDataToSubmit.append(backendKey, formData[key] ? "true" : "false");
          } else {
            formDataToSubmit.append(backendKey, formData[key]);
          }
        }
      });
  
      // 🔹 Log exactly what will be sent
      console.log("======= FormData Preview =======");
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(`${key}:`, value);
      }
      console.log("================================");
  
      const vendorId = formData.vendorId || initialData?.vendor?.vendor_id;
  
      let response;
      if (mode === "edit") {
        logDebug("Mode:", mode);
        logDebug("Edit URL:", `/vendors/${vendorId}/drivers/${initialData.driver_id}/`);
        let data = await API_CLIENT.get(`/vendors/tenants/drivers/?skip=0&limit=10`);
        logDebug(" the second test url :", data.data);
  
        response = await API_CLIENT.put(`/vendors/${vendorId}/drivers/${initialData.driver_id}`,formDataToSubmit );
        toast.success("Driver updated successfully!");
      } else {
        logDebug("Mode:", mode);
        logDebug("Create URL:", `/vendors/${vendorId}/drivers/`);
  
        response = await API_CLIENT.post(
          `/vendors/${vendorId}/drivers/`,
          formDataToSubmit
        );
  
        toast.success("Driver created successfully!");
      }
  
      logDebug("Driver saved successfully:", response.data);
  
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
  
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
  
        if (Array.isArray(backendErrors.detail)) {
          backendErrors.detail.forEach((err) => {
            toast.error(`${err.loc?.[1] || "field"}: ${err.msg}`);
          });
        } else if (backendErrors.detail) {
          toast.error(backendErrors.detail);
        } else {
          toast.error("Something went wrong, please try again.");
        }
      } else {
        toast.error("Server error, please try again later.");
      }
  
      setIsSubmitting(false);
      return;
    }
  
    setIsSubmitting(false);
  };
  

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personalDetails':
        return (
          <DriverPersonalDetails
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onCheckboxChange={handleCheckboxChange}
            vendors={vendors}
            loading={isSubmitting}
            mode={mode}
          />
        );
      
      case 'documents':
        return (
          <DocumentsTab
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onFileChange={handleFileChange}
            mode={mode==='edit' ? 'edit' : 'create'}
          />
        );
      
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
          errors={tabErrors}
          onTabChange={handleTabChange}
        />

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
  {onClose && (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      disabled={isSubmitting}
    >
      Cancel
    </button>
  )}

  {/* Show submit only if not in view mode */}
  {mode !== "view" && (
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting
        ? "Saving..."
        : mode === "edit"
        ? "Update Driver"
        : "Create Driver"}
    </button>
  )}
</div>

        </form>
      </div>
    </div>
  );
};

export default DriverForm;