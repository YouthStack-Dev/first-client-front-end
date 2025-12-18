import { FileText, Shield, Briefcase } from "lucide-react";

/* ======================================================
   DEFAULT FORM STATE
====================================================== */
export const defaultVehicleFormData = {
  vehicle_id: null,
  vendor_id: "",
  vehicle_type_id: "",
  driver_id: "",
  rc_number: "",
  description: "",
  rc_expiry_date: "",

  insurance_expiry_date: "",
  permit_expiry_date: "",
  puc_expiry_date: "",
  fitness_expiry_date: "",
  tax_receipt_date: "",

  insurance_file: null,
  permit_file: null,
  puc_file: null,
  fitness_file: null,
  tax_receipt_file: null,

  is_active: true,
};

/* ======================================================
   DOCUMENT CONFIG (LIKE DRIVER)
====================================================== */
export const vehicleDocuments = [
  {
    id: "insurance",
    label: "Insurance",
    fileKey: "insurance_file",
    expiryKey: "insurance_expiry_date",
    icon: Shield,
    color: "blue",
    urlKey: "insurance_url",
  },
  {
    id: "permit",
    label: "Permit",
    fileKey: "permit_file",
    expiryKey: "permit_expiry_date",
    icon: FileText,
    color: "purple",
    urlKey: "permit_url",
  },
  {
    id: "puc",
    label: "PUC Certificate",
    fileKey: "puc_file",
    expiryKey: "puc_expiry_date",
    icon: Briefcase,
    color: "green",
    urlKey: "puc_url",
  },
  {
    id: "fitness",
    label: "Fitness Certificate",
    fileKey: "fitness_file",
    expiryKey: "fitness_expiry_date",
    icon: Briefcase,
    color: "orange",
    urlKey: "fitness_url",
  },
  {
    id: "tax_receipt",
    label: "Tax Receipt",
    fileKey: "tax_receipt_file",
    expiryKey: "tax_receipt_date",
    icon: FileText,
    color: "red",
    urlKey: "tax_receipt_url",
  },
];

/* ======================================================
   BACKEND → FRONTEND
====================================================== */
export const transformVehicleApiToFormData = (apiData) => {
  if (!apiData) return { ...defaultVehicleFormData };

  const formData = {
    ...defaultVehicleFormData,
    vehicle_id: apiData.vehicle_id,
    vendor_id: apiData.vendor_id,
    vehicle_type_id: apiData.vehicle_type_id,
    driver_id: apiData.driver_id,
    rc_number: apiData.rc_number,
    description: apiData.description || "",
    rc_expiry_date: apiData.rc_expiry_date || "",
    insurance_expiry_date: apiData.insurance_expiry_date || "",
    permit_expiry_date: apiData.permit_expiry_date || "",
    puc_expiry_date: apiData.puc_expiry_date || "",
    fitness_expiry_date: apiData.fitness_expiry_date || "",
    tax_receipt_date: apiData.tax_receipt_date || "",
    is_active: apiData.is_active ?? true,
  };

  vehicleDocuments.forEach((doc) => {
    const url = apiData[doc.urlKey];
    formData[doc.fileKey] = url
      ? { path: url, name: url.split("/").pop() }
      : null;
  });

  return formData;
};

/* ======================================================
   FRONTEND → BACKEND (CREATE)
====================================================== */
export const buildVehicleFormData = (formData) => {
  const fd = new FormData();

  const textFields = {
    vendor_id: formData.vendor_id,
    vehicle_type_id: formData.vehicle_type_id,
    driver_id: formData.driver_id,
    rc_number: formData.rc_number,
    description: formData.description,
    rc_expiry_date: formData.rc_expiry_date,
    insurance_expiry_date: formData.insurance_expiry_date,
    permit_expiry_date: formData.permit_expiry_date,
    puc_expiry_date: formData.puc_expiry_date,
    fitness_expiry_date: formData.fitness_expiry_date,
    tax_receipt_date: formData.tax_receipt_date,
    is_active: formData.is_active,
  };

  Object.entries(textFields).forEach(([k, v]) => {
    if (v !== null && v !== undefined) {
      fd.append(k, v);
    }
  });

  vehicleDocuments.forEach((doc) => {
    const file = formData[doc.fileKey];
    if (file instanceof File) {
      fd.append(doc.fileKey, file);
    }
  });

  return fd;
};

/* ======================================================
   FRONTEND → BACKEND (UPDATE)
====================================================== */
export const buildVehicleUpdateData = (formData) => ({
  vehicle_id: formData.vehicle_id,
  vendor_id: formData.vendor_id,
  vehicle_type_id: formData.vehicle_type_id,
  driver_id: formData.driver_id,
  rc_number: formData.rc_number,
  description: formData.description,
  rc_expiry_date: formData.rc_expiry_date,
  insurance_expiry_date: formData.insurance_expiry_date,
  permit_expiry_date: formData.permit_expiry_date,
  puc_expiry_date: formData.puc_expiry_date,
  fitness_expiry_date: formData.fitness_expiry_date,
  tax_receipt_date: formData.tax_receipt_date,
  is_active: formData.is_active,
});
