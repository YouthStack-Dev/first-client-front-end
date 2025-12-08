import React, { useEffect, useState } from 'react';
import DriverTabNavigation from './DriverTabNavigation';
import DriverPersonalDetails from './DriverPersonalDetails';
import DocumentsTab from './DocumentsTab';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fieldMapping, transformBackendToFormData } from './driverUtility';
import { createDriverThunk, fetchDriversThunk, updateDriverThunk } from '../../redux/features/manageDriver/driverThunks';

const defaultFormData = {
  name: '',
  code: '',
  email: '',
  mobileNumber: '',
  gender: 'Male',
  password: '',
  dateOfBirth: '',
  dateOfJoining: '',
  permanentAddress: '',
  currentAddress: '',
  isSameAddress: false,
  licenseNumber: '',
  licenseExpiryDate: '',
  badgeNumber: '',
  badgeExpiryDate: '',
  inductionDate: '',
  bgvExpiryDate: '',
  policeExpiryDate: '',
  medicalExpiryDate: '',
  trainingExpiryDate: '',
  eyeTestExpiryDate: '',
  govtIdNumber: '',
  alternateGovtId: '',

  // Files
  profileImage: null,
  license_file: null,
  badge_file: null,
  alt_govt_id_file: null,
  bgv_file: null,
  police_file: null,
  medical_file: null,
  training_file: null,
  eye_file: null,
  induction_file: null,

  // Verification statuses
  bgvStatus: 'Pending',
  policeVerification: 'Pending',
  medicalVerification: 'Pending',
  trainingVerification: 'Pending',
  eyeTestStatus: 'Pending',
};


const tabs = ["personalDetails", "documents"];

const DriverForm = ({ initialData = null, mode, onClose, vendors = [] }) => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const driversLoading = useSelector(state => state.drivers.loading);

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


  // Live field-level validation
  const handleChange = e => {
    if (mode === 'view') return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errorMsg = '';
    const today = new Date();
    today.setHours(0,0,0,0);

    // Personal Details validations
    if (name === 'name' && !value.trim()) errorMsg = 'Driver name is required';
    if (name === 'mobileNumber') {
      if (!value.trim()) errorMsg = 'Mobile number is required';
      else if (!/^\d{10}$/.test(value)) errorMsg = 'Mobile number must be exactly 10 digits';
    }
    if (name === 'email') {
      if (!value.trim()) errorMsg = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Please enter a valid email address';
    }
    if (name === 'password' && mode === 'create' && !value.trim()) errorMsg = 'Password is required';
    if (name === 'code' && !value.trim()) errorMsg = 'Driver code is required';
    if (name === 'gender' && !value) errorMsg = 'Gender is required';
    if (name === 'dateOfBirth') {
      if (!value) errorMsg = 'Date of birth is required';
      else {
        const dob = new Date(value);
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        const isUnder18 = age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));
        if (isUnder18) errorMsg = 'Driver must be at least 18 years old';
      }
    }
    if (name === 'dateOfJoining' && !value) errorMsg = 'Date of joining is required';

    // Documents validations
    if ([
      'licenseExpiryDate', 'badgeExpiryDate', 'bgvExpiryDate', 'policeExpiryDate',
      'medicalExpiryDate', 'trainingExpiryDate', 'eyeTestExpiryDate'
    ].includes(name)) {
      if (!value) errorMsg = 'This date is required';
      else if (new Date(value) < today) errorMsg = 'Date must be in the future';
    }
    if (name === 'licenseNumber' && !value.trim()) errorMsg = 'License number is required';
    if (name === 'badgeNumber' && !value.trim()) errorMsg = 'Badge number is required';
    if (name === 'inductionDate' && !value) errorMsg = 'Induction date is required';
    if (name === 'govtIdNumber' && !value.trim()) errorMsg = 'Alternate Government ID is required';
    if (name === 'alternateGovtId' && !value.trim()) errorMsg = 'Alternate Government ID type is required';

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
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
    if (mode === "view") return;
    setFormData((prev) => {
      const newData = { ...prev, [name]: checked };

      // If checked, copy permanent address into current address
      if (name === "isSameAddress" && checked) {
        newData.current_address = prev.permanent_address;
      }

      return newData;
    });
  };


  // --- Validations ---
const validatePersonalDetails = () => {
  const personalErrors = {};
  const today = new Date();

  // Name
  if (!formData.name?.trim()) personalErrors.name = 'Driver name is required';

  // Mobile Number
  if (!formData.mobileNumber?.trim()) {
    personalErrors.mobileNumber = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
    personalErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
  }

  // Email
  if (!formData.email?.trim()) {
    personalErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    personalErrors.email = 'Please enter a valid email address';
  }

  // Password (only required in create mode)
  if (mode === 'create' && !formData.password?.trim()) {
    personalErrors.password = 'Password is required';
  }

  // Driver Code
  if (!formData.code?.trim()) personalErrors.code = 'Driver code is required';

  // Gender
  if (!formData.gender) personalErrors.gender = 'Gender is required';

  // Date of Birth validation (should be at least 18 years old)
  if (!formData.dateOfBirth) {
    personalErrors.dateOfBirth = 'Date of birth is required';
  } else {
    const dob = new Date(formData.dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    const isUnder18 =
      age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

    if (isUnder18) {
      personalErrors.dateOfBirth = 'Driver must be at least 18 years old';
    }
  }



  // If any validation errors exist, show toast messages
  if (Object.keys(personalErrors).length > 0) {
    Object.values(personalErrors).forEach((msg) => toast.error(msg));
  }

  return personalErrors;
};

  const validateDocuments = () => {
    const docErrors = {};
    const today = new Date();

    // File uploads
    const requiredFiles = [
      'bgv_file', 'police_file', 'medical_file', 'training_file',
      'eye_file', 'license_file', 'badge_file', 'alt_govt_id_file', 'induction_file'
    ];


    requiredFiles.forEach(file => {
      if (!(formData[file] instanceof File) && typeof formData[file] !== 'string') {
        docErrors[file] = 'This document is required';
      }
    });

    // Text/date fields
    if (!formData.licenseNumber?.trim()) docErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiryDate) docErrors.licenseExpiryDate = 'License expiry date is required';
    else if (new Date(formData.licenseExpiryDate) < today)
      docErrors.licenseExpiryDate = 'License expiry date cannot be in the past';

    if (!formData.badgeNumber?.trim()) docErrors.badgeNumber = 'Badge number is required';
    if (!formData.badgeExpiryDate) docErrors.badgeExpiryDate = 'Badge expiry date is required';
    else if (new Date(formData.badgeExpiryDate) < today)
      docErrors.badgeExpiryDate = 'Badge expiry date cannot be in the past';

    if (!formData.inductionDate) docErrors.inductionDate = 'Induction date is required';

    // Expiry dates for other verifications
    const expiryFields = [
      { key: 'bgvExpiryDate', label: 'BGV expiry date' },
      { key: 'policeExpiryDate', label: 'Police verification expiry date' },
      { key: 'medicalExpiryDate', label: 'Medical expiry date' },
      { key: 'trainingExpiryDate', label: 'Training expiry date' },
      { key: 'eyeTestExpiryDate', label: 'Eye test expiry date' }
    ];

    expiryFields.forEach(({ key, label }) => {
      if (!formData[key]) docErrors[key] = `${label} is required`;
      else if (new Date(formData[key]) < today) docErrors[key] = `${label} cannot be in the past`;
    });

    // Government ID
    if (!formData.govtIdNumber?.trim()) docErrors.govtIdNumber = 'Alternate Government ID is required';
    if (!formData.alternateGovtId?.trim()) docErrors.alternateGovtId = 'Alternate Government ID type is required';

    return docErrors;
  };


  // --- Tab navigation ---
  const handleNext = () => {
    let currentErrors = {};

    if (activeTab === 'personalDetails') {
      currentErrors = validatePersonalDetails();
      if (Object.keys(currentErrors).length > 0) {
        setErrors(prev => ({ ...prev, personalDetails: currentErrors }));
        console.log("Next clicked - personal details errors:", currentErrors);
        toast.error("Please fix errors before proceeding");
        return;
      }
    }

    // Clear current tab errors and do not touch next tab yet
    setErrors(prev => ({ ...prev, [activeTab]: {} }));

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

    // 1️⃣ Validate form
    const personalErrors = validatePersonalDetails();
    const documentErrors = validateDocuments();
    const allErrors = { ...personalErrors, ...documentErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setActiveTab(Object.keys(personalErrors).length > 0 ? "personalDetails" : "documents");
      return;
    }

    try {
      // 2️⃣ Create FormData
      const formDataToSubmit = new FormData();

      // File fields
      const fileFields = [
        "photo", "license_file", "badge_file", "alt_govt_id_file",
        "bgv_file", "police_file", "medical_file",
        "training_file", "eye_file", "induction_file"
      ];

      // Map regular fields (strings, booleans, dates, status)
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          const backendKey = fieldMapping[key] || key;

          // Capitalize status fields
          if (["bgvStatus", "policeVerification", "medicalVerification", "trainingVerification", "eyeTestStatus"].includes(key)) {
            const value = formData[key];
            const capitalized = value ? value.charAt(0).toUpperCase() + value.slice(1) : "Pending";
            formDataToSubmit.append(backendKey, capitalized);
          }
          // Dates
          else if (formData[key] instanceof Date) {
            const date = formData[key];
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            formDataToSubmit.append(backendKey, formattedDate);
          }
          else if (typeof formData[key] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(formData[key])) {
            // Already in YYYY-MM-DD format from input
            formDataToSubmit.append(backendKey, formData[key]);
          }
          // Booleans
          else if (typeof formData[key] === "boolean") {
            formDataToSubmit.append(backendKey, formData[key] ? "true" : "false");
          }
          // Strings / other
          else if (!(fileFields.includes(key))) { // skip files here
            formDataToSubmit.append(backendKey, formData[key]);
          }
        }
      });

      // Append file uploads ONLY if they are File objects
      fileFields.forEach((key) => {
        const file = formData[key];
        if (file instanceof File) {          // ONLY if new file is selected
          formDataToSubmit.append(fieldMapping[key] || key, file);
        }
      });

      // Log the FormData keys and values being submitted
      // console.log("Submitting driver data:");
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0]+ ':', pair[1]);
      }

      if (mode === "edit") {
        await dispatch(
          updateDriverThunk({ driverId: initialData.driver_id, formData: formDataToSubmit, })).unwrap();
        toast.success("Driver updated successfully!");
      } else {
        await dispatch(createDriverThunk(formDataToSubmit)).unwrap();
        toast.success("Driver created successfully!");
      }
      dispatch(fetchDriversThunk());
      if (onClose) onClose();

    } catch (error) {
      console.error("Error during submit:", error);
      toast.error(error?.message || "Something went wrong, please try again.");
    }
  };


  // --- Render tab content ---
  const renderTabContent = () => {
    if (activeTab === 'documents') {
      // console.log('--- Form Data for DocumentsTab ---', formData); // <-- Add this log
    }
    switch (activeTab) {
      case 'personalDetails':
        return <DriverPersonalDetails
          formData={formData} errors={errors} onChange={handleChange}
          onImageChange={handleImageChange} onCheckboxChange={handleCheckboxChange}
          vendors={vendors} loading={driversLoading} mode={mode}
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

        <DriverTabNavigation
          activeTab={activeTab}
          errors={{
            personalDetails: errors.personalDetails && Object.keys(errors.personalDetails).length > 0,
            documents: errors.documents && Object.keys(errors.documents).length > 0
          }}
          onTabChange={(tabId) => {
            // Validate personal details before moving to Documents tab
            if (tabId === 'documents') {
              const personalErrors = validatePersonalDetails();
              if (Object.keys(personalErrors).length > 0) {
                setErrors(prev => ({ ...prev, personalDetails: personalErrors }));
                toast.error("Please fix Personal Details before moving to Documents");
                return; // prevent tab change
              }
            }
            setActiveTab(tabId);
          }}
          validateTab={tabId => {
            if (tabId === 'personalDetails') return validatePersonalDetails();
            if (tabId === 'documents') return validateDocuments();
            return {};
          }}/>

        <form onSubmit={handleSubmit}>
          <div className="p-6">{renderTabContent()}</div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
            {/* Remove Previous button */}
            <div className="flex space-x-3 ml-auto">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={driversLoading}
                >
                  Cancel
                </button>
              )}
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={driversLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {driversLoading ? "Saving..." : mode === "edit" ? "Update Driver" : "Create Driver"}
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
