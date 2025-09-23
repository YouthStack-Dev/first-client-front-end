export const validateTab = (tab, formData) => {
    const errors = {};
  
    switch (tab) {
      case 'basicInfo':
        if (!formData.vendor) {
          errors.vendor = 'Please enter select Vendor';
        }
  
        if (!formData.vehicleId) {
          errors.vehicleId = 'Vehicle ID is required';
        }
  
        if (!formData.registrationNo) {
          errors.registrationNo = 'Registration number is required';
        }
        break;
  
      case 'contracts':
        if (!formData.vehicleType) {
          errors.vehicleType = 'Please select Vehicle Type';
        }
  
        if (!formData.changeContractFrom) {
          errors.changeContractFrom = 'Please select Change Contract From';
        }
  
        if (!formData.contract || formData.contract === 'NA') {
          errors.contract = 'Please enter select Contract';
        }
  
        if (!formData.workingTime) {
          errors.workingTime = 'Working Time is required';
        }
        break;
  
      case 'driver':
        if (!formData.driver) {
          errors.driver = 'Please select a driver';
        }
  
        if (!formData.garageName) {
          errors.garageName = 'Please enter valid Garage name';
        }
  
        if (!formData.garageGeocode) {
          errors.garageGeocode = 'Garage geocode is required';
        } else if (
          formData.garageGeocode.length < 9 ||
          !/^\d+\.\d+,\d+\.\d+$/.test(formData.garageGeocode)
        ) {
          errors.garageGeocode =
            'Garage GeoCords must be at least 9 characters long and in the format "num,num"';
        }
        break;
  
      default:
        break;
    }
  
    return errors;
  };
  
  export const validateForm = (formData) => {
    const basicInfoErrors = validateTab('basicInfo', formData);
    const contractsErrors = validateTab('contracts', formData);
    const driverErrors = validateTab('driver', formData);
  
    const tabsWithErrors = [];
  
    if (Object.keys(basicInfoErrors).length > 0) {
      tabsWithErrors.push('basicInfo');
    }
  
    if (Object.keys(contractsErrors).length > 0) {
      tabsWithErrors.push('contracts');
    }
  
    if (Object.keys(driverErrors).length > 0) {
      tabsWithErrors.push('driver');
    }
  
    return {
      isValid: tabsWithErrors.length === 0,
      tabsWithErrors,
    };
  };
  