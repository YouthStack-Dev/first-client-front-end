import React, { useState } from 'react';
import TabNavigation from './TabNavigation';
import BasicInfoTab from './BasicInfoTab';
import ContractsTab from './ContractsTab';
import DriverTab from './DriverTab';
import { Car } from 'lucide-react';
import HeaderWithActionNoRoute from './HeaderWithActionNoRoute';

const initialFormData = {
  // Basic Info
  vendor: '',
  vehicleId: '',
  registrationNo: '',
  status: 'Inactive from 07 May 2025',
  statusDate: '2025-05-07',
  simNumber: '',
  deviceImei: '',
  
  // Contracts
  vehicleType: '',
  changeContractFrom: '',
  contract: 'NA',
  startTimeHour: '00',
  startTimeMinute: '00',
  workingTime: '1440',
  sendAuditSms: 'driver',
  
  // Driver
  driver: '',
  garageName: '',
  mobileNo: '',
  garageGeocode: '',
  alternateMobileNo: '',
  details: '',
  comments: '',
};

const VehicleForm = () => {
  const [activeTab, setActiveTab] = useState('basicInfo');
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
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      statusDate: date,
    }));
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      sendAuditSms: value,
    }));
  };

  const validateBasicInfoTab = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = 'Please enter select Vendor';
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle ID is required';
    if (!formData.registrationNo) newErrors.registrationNo = 'Registration number is required';

    setErrors(newErrors);
    setTabErrors(prev => ({ ...prev, basicInfo: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const validateContractsTab = () => {
    const newErrors = {};
    if (!formData.vehicleType) newErrors.vehicleType = 'Please select Vehicle Type';
    if (!formData.changeContractFrom) newErrors.changeContractFrom = 'Please select Change Contract From';
    if (!formData.contract || formData.contract === 'NA') newErrors.contract = 'Please enter select Contract';
    if (!formData.workingTime) newErrors.workingTime = 'Working Time is required';

    setErrors(newErrors);
    setTabErrors(prev => ({ ...prev, contracts: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const validateDriverTab = () => {
    const newErrors = {};
    if (!formData.driver) newErrors.driver = 'Please select a driver';
    if (!formData.garageName) newErrors.garageName = 'Please enter valid Garage name';
    if (!formData.garageGeocode) {
      newErrors.garageGeocode = 'Garage geocode is required';
    } else if (formData.garageGeocode.length < 9 || !/^\d+\.\d+,\d+\.\d+$/.test(formData.garageGeocode)) {
      newErrors.garageGeocode = 'Garage GeoCords must be at least 9 characters long and in the format "num,num"';
    }

    setErrors(newErrors);
    setTabErrors(prev => ({ ...prev, driver: Object.keys(newErrors).length > 0 }));

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (activeTab === 'basicInfo') {
      isValid = validateBasicInfoTab();
      if (isValid) setActiveTab('contracts');
    } else if (activeTab === 'contracts') {
      isValid = validateContractsTab();
      if (isValid) setActiveTab('driver');
    }
  };

  const handleBack = () => {
    if (activeTab === 'contracts') {
      setActiveTab('basicInfo');
    } else if (activeTab === 'driver') {
      setActiveTab('contracts');
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'driver') {
      const isValid = validateDriverTab();
      if (isValid) {
        const isBasicInfoValid = validateBasicInfoTab();
        const isContractsValid = validateContractsTab();

        if (isBasicInfoValid && isContractsValid && isValid) {
          alert('Form submitted successfully!');
          console.log('Form data:', formData);
        } else {
          if (!isBasicInfoValid) {
            setActiveTab('basicInfo');
          } else if (!isContractsValid) {
            setActiveTab('contracts');
          }
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
       <HeaderWithActionNoRoute
            title="Add New Vehicle"
           
            showBackButton={true}
            // or any custom handler
          />

      <div className="bg-white max-h-[600px] rounded-lg  overflow-y-auto">
        <TabNavigation
          activeTab={activeTab}
          errors={tabErrors}
          onTabChange={handleTabChange}
        />

        <div className="p-4">
          {activeTab === 'basicInfo' && (
            <BasicInfoTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onDateChange={handleDateChange}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onRadioChange={handleRadioChange}
            />
          )}

          {activeTab === 'driver' && (
            <DriverTab
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          <div className="flex justify-between mt-6">
            {activeTab !== 'basicInfo' && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                Back
              </button>
            )}
            {activeTab !== 'driver' ? (
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
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
