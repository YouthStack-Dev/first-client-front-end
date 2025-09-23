// Basic email validation
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Phone number validation (adjust pattern as needed)
  export const validatePhone = (phone) => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{3,6}$/im;
    return re.test(phone);
  };
  
  // Generic required field validation
  export const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };
  
  // Complete form validator
  export const validateVendorForm = (formData) => {
    const errors = {};
    
    if (!validateRequired(formData.name)) {
      errors.name = "Vendor name is required";
    }
    
    if (!validateRequired(formData.email)) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };