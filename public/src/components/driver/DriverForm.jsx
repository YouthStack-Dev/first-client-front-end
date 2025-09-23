import React from 'react';
import DriverTabNavigation from './DriverTabNavigation';
// import PersonalDetailsTabUI from '../PersonalDetailsTab';
import DocumentsTab from './DocumentsTab';
import PersonalDetailsTabUI from './PersonalDetailsTab';
import { logDebug } from '../../utils/logger';

const DriverFormUI = ({ vendors = [], initialData, isEdit }) => {
  // State variables
  const [formData, setFormData] = React.useState(initialData || {});
  const [errors, setErrors] = React.useState({});
  const [documentError, setDocumentError] = React.useState({});
  const [tabErrors, setTabErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('personalDetails');

  // Event handlers
  const onInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const onImageChange = (field, image) => {
    setFormData({ ...formData, [field]: image });
  };

  const onFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const onCheckboxChange = (field, checked) => {
    setFormData({ ...formData, [field]: checked });
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
  };


  const onSave = async () => {
    setIsSubmitting(true);
    setErrors({});
    setDocumentError({});
    setTabErrors({});
    logDebug('Form Data:', formData);
    // try {
    //   let response;
      
    //   if (isEdit) {
    //     // Update existing driver
    //     response = await axios.put(`${API_BASE_URL}/${formData.id}`, formData);
    //   } else {
    //     // Create new driver
    //     response = await axios.post(API_BASE_URL, formData);
    //   }

    //   // Handle successful response
    //   if (onSuccess) {
    //     onSuccess(response.data); // Call parent component's success handler
    //   }
      
      
    // } catch (error) {
    //   // Handle API errors
    //   if (error.response) {
    //     // Backend validation errors
    //     const { data } = error.response;
        
    //     if (data.errors) {
    //       // Field-specific errors
    //       setErrors(data.errors);
    //     } else if (data.message) {
    //       // General error message
    //       setErrors({ general: data.message });
    //     }
    //   } else {
    //     // Network or other errors
    //     setErrors({ general: 'An error occurred. Please try again.' });
    //   }
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const onNext = () => {
    if (activeTab === 'personalDetails') {
      setActiveTab('documents');
    }
  };

  const onBack = () => {
    if (activeTab === 'documents') {
      setActiveTab('personalDetails');
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-4">


      <div className="bg-white max-h-[600px] rounded-lg overflow-y-auto">
        <DriverTabNavigation 
          activeTab={activeTab} 
          errors={tabErrors} 
          onTabChange={onTabChange} 
        />

        <div className="p-4">
          {activeTab === 'personalDetails' && (
            <PersonalDetailsTabUI
              formData={formData}
              errors={errors}
              onChange={onInputChange}
              onImageChange={onImageChange}
              onCheckboxChange={onCheckboxChange}
              vendors={vendors}  
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              formData={formData}
              errors={errors}
              documentError={documentError}
              onChange={onInputChange}
              onFileChange={onFileChange}  
            />
          )}

          <div className="flex justify-between mt-6">
            {activeTab !== 'personalDetails' ? (
              <button 
                onClick={onBack} 
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain flex spacing
            )}

            <button
              onClick={activeTab !== 'documents' ? onNext : onSave}
              disabled={isSubmitting}
              className={`ml-auto px-6 py-2 rounded-md transition ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {activeTab !== 'documents' 
                ? 'Next' 
                : isSubmitting 
                  ? 'Submitting...' 
                  : isEdit ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverFormUI;