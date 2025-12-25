// src/validations/core/helpers.js

export const formatFieldErrors = (errors, fieldName) => {
  if (!errors) return "";
  if (errors[fieldName])
    return Array.isArray(errors[fieldName])
      ? errors[fieldName][0]
      : errors[fieldName];

  for (const key in errors) {
    if (key.startsWith(fieldName + ".")) {
      return Array.isArray(errors[key]) ? errors[key][0] : errors[key];
    }
  }
  return "";
};

export const extractApiValidationErrors = (apiError) => {
  const errors = {};

  if (apiError?.detail) {
    const details = apiError.detail;

    if (Array.isArray(details)) {
      details.forEach((err) => {
        const loc = err.loc || [];
        const field = loc.length >= 2 ? loc[1] : "general";
        const msg = err.msg || "Validation error";

        if (!errors[field]) errors[field] = msg;
      });
    }
  } else if (apiError?.message) {
    errors.general = apiError.message;
  }

  return errors;
};

// Real-time validation functions
export const validationRules = {
  // Future date validation (expiry dates)
  validateFutureDate: (dateString, fieldName = "Expiry date") => {
    if (!dateString) return null; // Optional field, no error if empty

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return `${fieldName} must be today or in the future`;
    }
    return null;
  },

  // Past date validation
  validatePastDate: (dateString, fieldName = "Date") => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return `${fieldName} cannot be in the future`;
    }
    return null;
  },

  // Date of birth validation (must be at least 18 years old)
  validateDateOfBirth: (dateString) => {
    if (!dateString) return "Date of birth is required";

    const dob = new Date(dateString);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return "Driver must be at least 18 years old";
    }

    // Check if date is in future
    if (dob > today) {
      return "Date of birth cannot be in the future";
    }

    return null;
  },

  // Mobile number validation
  validateMobileNumber: (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "Please enter a valid 10-digit Indian mobile number";
    }
    return null;
  },

  // Email validation
  validateEmail: (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  // Aadhar validation
  validateAadhar: (aadhar) => {
    if (!aadhar) return null;
    if (!/^\d{12}$/.test(aadhar)) {
      return "Aadhar number must be 12 digits";
    }
    return null;
  },

  // PAN validation
  validatePAN: (pan) => {
    if (!pan) return null;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return "Please enter a valid PAN number";
    }
    return null;
  },

  // File validation
  validateFile: (file, isRequired = true) => {
    if (!file && isRequired) return "File is required";
    if (!file) return null;

    if (file instanceof File) {
      // File size validation (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return "File size must be less than 5MB";
      }

      // File type validation
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        return "File must be PDF, JPG, JPEG, PNG, or WebP";
      }
    }
    return null;
  },
};

export const getTomorrowDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today.toISOString().split("T")[0];
};
