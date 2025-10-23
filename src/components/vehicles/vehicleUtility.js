// src/utils/vehicleTransform.js

/**
 * Vehicle data transformer for backend ↔ frontend
 * Handles conversion between form data and API structure
 */

// -------- FRONTEND → BACKEND --------
export const transformFormDataToBackend = (formData) => {
  if (!formData) return null;

  const backendData = new FormData();

  // ✅ Map only allowed fields
  const fieldMap = {
    vendor_id: "vendor_id",
    vehicle_type_id: "vehicle_type_id",
    rc_number: "rc_number",
    driver_id: "driver_id",
    description: "description",
    rc_expiry_date: "rc_expiry_date",
    insurance_expiry_date: "insurance_expiry_date",
    permit_expiry_date: "permit_expiry_date",
    puc_expiry_date: "puc_expiry_date",
    fitness_expiry_date: "fitness_expiry_date",
    tax_receipt_date: "tax_receipt_date",
    is_active: "is_active",
  };

  // Append text/date/boolean fields
  Object.entries(fieldMap).forEach(([frontendKey, backendKey]) => {
    const value = formData[frontendKey];
    if (value !== null && value !== undefined && value !== "") {
      backendData.append(backendKey, value);
    }
  });

  // ✅ Append files only if user selected a new one
  const fileFields = [
    "insurance_file",
    "permit_file",
    "puc_file",
    "fitness_file",
    "tax_receipt_file",
  ];

  fileFields.forEach((field) => {
    const file = formData[field];
    if (file instanceof File) {
      backendData.append(field, file);
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
    insurance_expiry_date: backendData.insurance_expiry_date || "",
    permit_expiry_date: backendData.permit_expiry_date || "",
    puc_expiry_date: backendData.puc_expiry_date || "",
    fitness_expiry_date: backendData.fitness_expiry_date || "",
    tax_receipt_date: backendData.tax_receipt_date || "",
    is_active: backendData.is_active ?? true,

    // ✅ URLs from backend (for viewing/downloading)
    insurance_url: backendData.insurance_url || "",
    permit_url: backendData.permit_url || "",
    puc_url: backendData.puc_url || "",
    fitness_url: backendData.fitness_url || "",
    tax_receipt_url: backendData.tax_receipt_url || "",

    // ✅ Initialize upload fields as null
    insurance_file: null,
    permit_file: null,
    puc_file: null,
    fitness_file: null,
    tax_receipt_file: null,
  };

  return transformed;
};
