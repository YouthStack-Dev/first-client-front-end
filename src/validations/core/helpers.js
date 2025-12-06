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
