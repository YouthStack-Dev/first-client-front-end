// src/utils/vehicleTransform.js

/**
 * Vehicle data transformer for backend ↔ frontend
 * Ensures all required fields are appended properly, even if empty
 */

// -------- FRONTEND → BACKEND --------
export const transformFormDataToBackend = (formData) => {
  if (!formData) return null;

  const backendData = new FormData();

  // ✅ All required text/date/boolean fields
  const fieldMap = {
    vendor_id: "vendor_id",
    vehicle_type_id: "vehicle_type_id",
    rc_number: "rc_number",
    driver_id: "driver_id",
    description: "description",
    rc_expiry_date: "rc_expiry_date",
    puc_expiry_date: "puc_expiry_date",
    fitness_expiry_date: "fitness_expiry_date",
    tax_receipt_date: "tax_receipt_date",
    insurance_expiry_date: "insurance_expiry_date",
    permit_expiry_date: "permit_expiry_date",
    is_active: "is_active",
  };

  // Append every field (even if empty string)
  Object.entries(fieldMap).forEach(([frontendKey, backendKey]) => {
    const value =
      formData[frontendKey] !== undefined && formData[frontendKey] !== null
        ? formData[frontendKey]
        : "";
    backendData.append(backendKey, value);
  });

  // ✅ File fields (required by backend even if null)
  const fileFields = [
    "puc_file",
    "fitness_file",
    "tax_receipt_file",
    "insurance_file",
    "permit_file",
  ];

  fileFields.forEach((field) => {
    const file = formData[field];
    if (file instanceof File) {
      backendData.append(field, file);
    } else {
      // append empty value if no file selected
      backendData.append(field, "");
    }
  });

  return backendData;
};

// -------- BACKEND → FRONTEND --------
export const transformBackendToFormData = (backendData) => {
  if (!backendData) return {};

  const transformed = {
    vehicle_id: backendData.vehicle_id || "",
    vendor_id: backendData.vendor_id || "",
    vehicle_type_id: backendData.vehicle_type_id || "",
    driver_id: backendData.driver_id || "",
    rc_number: backendData.rc_number || "",
    description: backendData.description || "",
    rc_expiry_date: backendData.rc_expiry_date || "",
    puc_expiry_date: backendData.puc_expiry_date || "",
    fitness_expiry_date: backendData.fitness_expiry_date || "",
    tax_receipt_date: backendData.tax_receipt_date || "",
    insurance_expiry_date: backendData.insurance_expiry_date || "",
    permit_expiry_date: backendData.permit_expiry_date || "",
    is_active: backendData.is_active ?? true,

    // ✅ Backend file URLs for preview/download
    puc_url: backendData.puc_url || "",
    fitness_url: backendData.fitness_url || "",
    tax_receipt_url: backendData.tax_receipt_url || "",
    insurance_url: backendData.insurance_url || "",
    permit_url: backendData.permit_url || "",

    // ✅ Initialize file upload fields
    puc_file: null,
    fitness_file: null,
    tax_receipt_file: null,
    insurance_file: null,
    permit_file: null,
  };

  return transformed;
};
