// import React, { useEffect, useState } from 'react';
// import { useDispatch  } from 'react-redux';

// import DriverTabNavigation from './DriverTabNavigation';
// import PersonalDetailsTab from './DriverPersonalDetails';
// import DocumentsTab from './DocumentsTab';

// import { logDebug, logError } from '../../utils/logger';

// const defaultFormData = {
//   driverName: '', dateOfBirth: '', mobileNumber: '', driverId: '',
//   permanentAddress: '', currentAddress: '', isSameAddress: false,
//   alternateMobileNumber: '', city: '', vendor: '', email: '', password: '',
//   gender: 'male', bgvStatus: 'pending', policeVerification: 'pending',
//   medicalVerification: 'pending', trainingVerification: 'pending', eyeTestStatus: 'pending',
//   bgvExpiryDate: '', policeExpiryDate: '', medicalExpiryDate: '', trainingExpiryDate: '',
//   eyeTestExpiryDate: '', licenseNumber: '', licenseExpiryDate: '', inductionDate: '',
//   badgeNumber: '', badgeExpiryDate: '', alternateGovtId: '', govtIdNumber: '',
//   bgvDocument: null, policeDocument: null, medicalDocument: null, trainingDocument: null,
//   eyeTestDocument: null, licenseDocument: null, inductionDocument: null,
//   badgeDocument: null, govtIdDocument: null, profileImage: null,
// };

// const DriverForm = ({ 
//   initialData = null, 
//   mode = 'create', // 'create', 'edit', 'view'
//   vendors = [],
//   onClose = () => {}
// }) => {
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState('personalDetails');
//   const [formData, setFormData] = useState(defaultFormData);
//   const [errors, setErrors] = useState({});
//   const [documentError, setDocumentError] = useState({});
//   const [tabErrors, setTabErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [personalValid, setPersonalValid] = useState(false);

//   const isReadOnly = mode === 'view';
//   const isEdit = mode === 'edit';
//   const isCreate = mode === 'create';

//   useEffect(() => {
//     if (initialData) setFormData(initializeFormData(initialData));
//   }, [initialData]);

//   const initializeFormData = (data) => ({
//     ...defaultFormData,
//     driverName: data.name || '', 
//     dateOfBirth: data.date_of_birth || '',
//     mobileNumber: data.mobile_number || '', 
//     driverId: data.driver_code || '',
//     permanentAddress: data.permanent_address || '', 
//     currentAddress: data.current_address || '',
//     alternateMobileNumber: data.alternate_mobile_number || '', 
//     city: data.city || '',
//     vendor: data.vendor?.vendor_id || '', 
//     email: data.email || '', 
//     gender: data.gender || 'male',
//     bgvStatus: data.bgv_status || 'pending', 
//     policeVerification: data.police_verification_status || 'pending',
//     medicalVerification: data.medical_verification_status || 'pending', 
//     trainingVerification: data.training_verification_status || 'pending',
//     eyeTestStatus: data.eye_test_verification_status || 'pending',
//     bgvExpiryDate: data.bgv_date || '', 
//     policeExpiryDate: data.police_verification_date || '',
//     medicalExpiryDate: data.medical_verification_date || '', 
//     trainingExpiryDate: data.training_verification_date || '',
//     eyeTestExpiryDate: data.eye_test_verification_date || '', 
//     licenseNumber: data.license_number || '',
//     licenseExpiryDate: data.license_expiry_date || '', 
//     inductionDate: data.induction_date || '',
//     badgeNumber: data.badge_number || '', 
//     badgeExpiryDate: data.badge_expiry_date || '',
//     alternateGovtId: data.alternate_govt_id || '', 
//     govtIdNumber: data.govt_id_number || '',
    
//     // Document URLs for existing documents
//     bgvDocument: data.bgv_doc_url || null,
//     policeDocument: data.police_verification_doc_url || null,
//     medicalDocument: data.medical_verification_doc_url || null,
//     trainingDocument: data.training_verification_doc_url || null,
//     eyeTestDocument: data.eye_test_verification_doc_url || null,
//     licenseDocument: data.license_doc_url || null,
//     inductionDocument: data.induction_doc_url || null,
//     badgeDocument: data.badge_doc_url || null,
//     govtIdDocument: data.alternate_govt_id_doc_url || null,
//     profileImage: data.photo_url || null,

//     // Document names for display
//     bgvDocumentName: data.bgv_doc_url?.split('/').pop() || '',
//     policeDocumentName: data.police_verification_doc_url?.split('/').pop() || '',
//     medicalDocumentName: data.medical_verification_doc_url?.split('/').pop() || '',
//     trainingDocumentName: data.training_verification_doc_url?.split('/').pop() || '',
//     eyeTestDocumentName: data.eye_test_verification_doc_url?.split('/').pop() || '',
//     licenseDocumentName: data.license_doc_url?.split('/').pop() || '',
//     inductionDocumentName: data.induction_doc_url?.split('/').pop() || '',
//     badgeDocumentName: data.badge_doc_url?.split('/').pop() || '',
//     govtIdDocumentName: data.alternate_govt_id_doc_url?.split('/').pop() || '',
//   });
//   const getFieldMap = () => ({
//     driver_code: formData.driverId,
//     name: formData.driverName,
//     email: formData.email,
//     hashed_password: formData.password,
//     mobile_number: formData.mobileNumber,
//     city: formData.city,
//     date_of_birth: formData.dateOfBirth,
//     gender: formData.gender,
//     alternate_mobile_number: formData.alternateMobileNumber,
//     permanent_address: formData.permanentAddress,
//     current_address: formData.currentAddress,
//     bgv_status: formData.bgvStatus,
//     bgv_date: formData.bgvExpiryDate,
//     police_verification_status: formData.policeVerification,
//     police_verification_date: formData.policeExpiryDate,
//     medical_verification_status: formData.medicalVerification,
//     medical_verification_date: formData.medicalExpiryDate,
//     training_verification_status: formData.trainingVerification,
//     training_verification_date: formData.trainingExpiryDate,
//     eye_test_verification_status: formData.eyeTestStatus,
//     eye_test_verification_date: formData.eyeTestExpiryDate,
//     license_number: formData.licenseNumber,
//     license_expiry_date: formData.licenseExpiryDate,
//     induction_date: formData.inductionDate,
//     badge_number: formData.badgeNumber,
//     badge_expiry_date: formData.badgeExpiryDate,
//     alternate_govt_id: formData.alternateGovtId,
//     govt_id_number: formData.govtIdNumber,
//     alternate_govt_id_doc_type: formData.alternateGovtIdDocType,
//   });

//   const getFileMap = () => ({
//     photo_image: formData.profileImage instanceof File ? formData.profileImage : null,
//     bgv_doc_file: formData.bgvDocument instanceof File ? formData.bgvDocument : null,
//     police_verification_doc_file: formData.policeDocument instanceof File ? formData.policeDocument : null,
//     medical_verification_doc_file: formData.medicalDocument instanceof File ? formData.medicalDocument : null,
//     training_verification_doc_file: formData.trainingDocument instanceof File ? formData.trainingDocument : null,
//     eye_test_verification_doc_file: formData.eyeTestDocument instanceof File ? formData.eyeTestDocument : null,
//     license_doc_file: formData.licenseDocument instanceof File ? formData.licenseDocument : null,
//     induction_doc_file: formData.inductionDocument instanceof File ? formData.inductionDocument : null,
//     badge_doc_file: formData.badgeDocument instanceof File ? formData.badgeDocument : null,
//     alternate_govt_id_doc_file: formData.govtIdDocument instanceof File ? formData.govtIdDocument : null,
//   });

//     const handleInputChange = (e) => {
//       const { name, value } = e.target;
//   console.log(`[INPUT CHANGE] ${name}: ${value}`);

//     };

//   const handleImageChange = (file) => {
//     if (isReadOnly || !file) return;
//     setFormData((prev) => ({ ...prev, profileImage: file }));
//   };

//   const handleFileChange = (name, file) => {
//     if (isReadOnly || !file) return;
//     setFormData((prev) => ({ ...prev, [name]: file, [`${name}Name`]: file.name }));
//   };

//   const handleCheckboxChange = (name, checked) => {
//     if (isReadOnly) return;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: checked,
//       ...(name === 'isSameAddress' && checked ? { currentAddress: prev.permanentAddress } : {}),
//     }));
//   };

//   const validatePersonalDetails = () => {
//     if (isReadOnly) return true;
    
//     const errors = {};
//     const requiredFields = [
//       'driverName',
//       'dateOfBirth',
//       'mobileNumber',
//       'city',
//       'vendor',
//       'gender',
//       'email',
//     ];

//     // Add password requirement only for create mode
//     if (isCreate) {
//       requiredFields.push('password');
//     }

//     requiredFields.forEach((field) => {
//       if (!formData[field] || formData[field].toString().trim() === '') {
//         errors[field] = `${field} is required`;
//       }
//     });

//     if (formData.mobileNumber) {
//       const mobile = formData.mobileNumber.trim();
//       if (!/^\d{10}$/.test(mobile)) {
//         errors.mobileNumber = 'Enter a valid 10-digit mobile number';
//       }
//     }

//     if (formData.alternateMobileNumber) {
//       const altMobile = formData.alternateMobileNumber.trim();
//       if (!/^\d{10}$/.test(altMobile)) {
//         errors.alternateMobileNumber = 'Enter a valid 10-digit alternate number';
//       } else if (altMobile === formData.mobileNumber) {
//         errors.alternateMobileNumber = 'Alternate number must be different from mobile number';
//       }
//     }
    
//     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
//       errors.email = 'Enter a valid email address';
//     }

//     if (formData.dateOfBirth) {
//       const dob = new Date(formData.dateOfBirth);
//       const today = new Date();
//       let age = today.getFullYear() - dob.getFullYear();
//       const isBeforeBirthday =
//         today.getMonth() < dob.getMonth() ||
//         (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
//       if (isBeforeBirthday) age--;

//       if (age < 18) {
//         errors.dateOfBirth = 'Driver must be at least 18 years old';
//       }
//     }

//     setErrors(errors);
//     setTabErrors((prev) => ({
//       ...prev,
//       personalDetails: Object.keys(errors).length > 0,
//     }));

//     return Object.keys(errors).length === 0;
//   };

//   const validateDocuments = () => {
//     if (isReadOnly) return true;
    
//     const errors = {};
//     const docFields = [
//       ["bgvDocument", "bgvDocumentName", "BGV"],
//       ["policeDocument", "policeDocumentName", "Police Verification"],
//       ["medicalDocument", "medicalDocumentName", "Medical"],
//       ["trainingDocument", "trainingDocumentName", "Training Certificate"],
//       ["eyeTestDocument", "eyeTestDocumentName", "Eye Test"],
//       ["licenseDocument", "licenseDocumentName", "Driving License"],
//       ["inductionDocument", "inductionDocumentName", "Induction Certificate"],
//       ["badgeDocument", "badgeDocumentName", "Badge"],
//       ["govtIdDocument", "govtIdDocumentName", "Government ID"],
//     ];

//     docFields.forEach(([field, nameField, label]) => {
//       const hasUploadedFile = formData[field] instanceof File;
//       const hasExistingUrl = typeof formData[field] === 'string' && formData[field];
//       const hasDocumentName = !!formData[nameField];
      
//       if (!hasUploadedFile && !hasExistingUrl && !hasDocumentName) {
//         errors[field] = `${label} document is required`;
//       }
//     });

//     setDocumentError(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const mapToFormData = () => {
//     const form = new FormData();
//     const fieldMap = getFieldMap();
//     const fileMap = getFileMap();

//     Object.entries(fieldMap).forEach(([key, val]) => form.append(key, val || ''));
//     Object.entries(fileMap).forEach(([key, file]) => { if (file) form.append(key, file); });
//     return { vendorId: formData.vendor || vendors[0]?.vendor_id || '', payload: form };
//   };
//   const handleSave = async () => {
//     if (isReadOnly) return;
    
//     const isPersonalValid = validatePersonalDetails();
//     const isDocumentValid = validateDocuments();
  
//     if (!isPersonalValid || !isDocumentValid) {
//       logDebug('[VALIDATION FAILED] Personal or document validation failed.');
//       return;
//     }
  
//     const { vendorId, payload } = mapToFormData();
//     // setIsSubmitting(true);
  
//     logDebug('[SUBMITTING]', { vendorId, payload });
//     // try {
//     //   if (isEdit) {
//     //     // For update operation - hit the update endpoint
//     //     const response = await API_CLIENT.put(
//     //       `/vendors/${vendorId}/drivers/${initialData?.driver_id}`,
//     //       payload,
//     //       {
//     //         headers: {
//     //           'Content-Type': 'multipart/form-data'
//     //         }
//     //       }
//     //     );
        
//     //     // Dispatch the updated driver data to Redux
//     //     dispatch(updateDriverStatus({
//     //       driverId: initialData?.driver_id,
//     //       updatedData: response.data
//     //     }));
        
//     //     toast.success('Driver updated successfully');
//     //   } else if (isCreate) {
//     //     // For create operation - hit the create endpoint
//     //     const response = await API_CLIENT.post(
//     //       `/vendors/${vendorId}/drivers`,
//     //       payload,
//     //       {
//     //         headers: {
//     //           'Content-Type': 'multipart/form-data'
//     //         }
//     //       }
//     //     );
        
//     //     // Dispatch the new driver data to Redux
//     //     dispatch(addNewDriver(response.data));
        
//     //     toast.success('Driver created successfully');
//     //   }
//     //   onClose();
//     // } catch (error) {
//     //   logError('[SAVE FAILED]', error);
//     //   toast.error(error.response?.data?.message || 'Something went wrong while saving the driver.');
//     // } finally {
//     //   setIsSubmitting(false);
//     // }
//   };

//   const handleNext = () => {
//     if (isReadOnly) {
//       setActiveTab('documents');
//       return;
//     }
    
//     const valid = validatePersonalDetails();
//     setPersonalValid(valid);
//     if (valid) setActiveTab('documents');
//   };

//   const getButtonText = () => {
//     if (isReadOnly) return 'Close';
//     if (activeTab !== 'documents') return 'Next';
//     if (isSubmitting) return 'Submitting...';
//     return isEdit ? 'Update' : 'Submit';
//   };
//   logDebug('[RENDER] DriverForm', )

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="bg-white max-h-[600px] rounded-lg overflow-y-auto">
//         <DriverTabNavigation 
//           activeTab={activeTab} 
//           errors={tabErrors} 
//           onTabChange={setActiveTab}
//           mode={mode}
//         />

//         <div className="p-4">
//           {activeTab === 'personalDetails' && (
//             <PersonalDetailsTab
//               formData={formData}
//               errors={errors}
//               onChange={handleInputChange}
//               onImageChange={handleImageChange}
//               onCheckboxChange={handleCheckboxChange}
//               vendors={vendors}
//               mode={mode}
//             />
//           )}

//           {/* {activeTab === 'documents' && (
//             <DocumentsTab
//               formData={formData}
//               errors={documentError}
//               onChange={handleInputChange}
//               onFileChange={handleFileChange}
//               mode={mode}
//             />
//           )} */}

//           <div className="flex justify-between mt-6">
//             {activeTab !== 'personalDetails' && !isReadOnly && (
//               <button 
//                 onClick={() => setActiveTab('personalDetails')} 
//                 className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
//               >
//                 Back
//               </button>
//             )}

//             {isReadOnly && activeTab !== 'personalDetails' && (
//               <button 
//                 onClick={() => setActiveTab('personalDetails')} 
//                 className="px-6 py-2 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-50"
//               >
//                 Back
//               </button>
//             )}

//             <button
//               onClick={activeTab !== 'documents' ? handleNext : (isReadOnly ? onClose : handleSave)}
//               disabled={isSubmitting}
//               className={`ml-auto px-6 py-2 rounded-md transition ${
//                 isSubmitting 
//                   ? 'bg-gray-400 cursor-not-allowed text-white' 
//                   : isReadOnly
//                   ? 'bg-gray-600 text-white hover:bg-gray-700'
//                   : 'bg-blue-600 text-white hover:bg-blue-700'
//               }`}
//             >
//               {getButtonText()}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverForm;