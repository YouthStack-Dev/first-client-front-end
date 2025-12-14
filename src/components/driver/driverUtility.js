import { Briefcase, Eye, FileText, Shield } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { validationRules } from "../../validations/core/helpers";

export const defaultFormData = {
  name: "",
  code: "",
  email: "",
  mobileNumber: "",
  gender: "Male",
  password: "",
  dateOfBirth: "",
  dateOfJoining: "",
  permanentAddress: "",
  currentAddress: "",
  isSameAddress: false,
  licenseNumber: "",
  licenseExpiryDate: "",
  badgeNumber: "",
  badgeExpiryDate: "",
  inductionDate: "",
  bgvExpiryDate: "",
  policeExpiryDate: "",
  medicalExpiryDate: "",
  trainingExpiryDate: "",
  eyeTestExpiryDate: "",
  alternateGovtId: "", // ID Number
  alternateGovtIdType: "", // ID Type (aadhar/pan/voter/passport)
  vendor_id: "", // Added vendor ID
  profileImage: null,
  license_file: null,
  badge_file: null,
  alt_govt_id_file: null,
  bgv_file: null,
  police_file: null,
  medical_file: null,
  training_file: null,
  eye_file: null,
  induction_file: null,
  bgvStatus: "Pending",
  policeVerification: "Pending",
  medicalVerification: "Pending",
  trainingVerification: "Pending",
  eyeTestStatus: "Pending",
};

export const documents = [
  {
    id: "license",
    label: "Driving License",
    fileKey: "license_file",
    numberKey: "licenseNumber",
    expiryKey: "licenseExpiryDate",
    icon: Briefcase,
    color: "blue",
  },
  {
    id: "badge",
    label: "Security Badge",
    fileKey: "badge_file",
    numberKey: "badgeNumber",
    expiryKey: "badgeExpiryDate",
    icon: Shield,
    color: "green",
  },
  {
    id: "alt_govt_id",
    label: "Alternate Govt ID",
    fileKey: "alt_govt_id_file",
    numberKey: "alternateGovtId",
    typeKey: "alternateGovtIdType",
    icon: FileText,
    color: "purple",
  },
  {
    id: "bgv",
    label: "Background Verification",
    fileKey: "bgv_file",
    expiryKey: "bgvExpiryDate",
    statusKey: "bgvStatus",
    icon: Shield,
    color: "red",
  },
  {
    id: "police",
    label: "Police Verification",
    fileKey: "police_file",
    expiryKey: "policeExpiryDate",
    statusKey: "policeVerification",
    icon: Shield,
    color: "indigo",
  },
  {
    id: "medical",
    label: "Medical Certificate",
    fileKey: "medical_file",
    expiryKey: "medicalExpiryDate",
    statusKey: "medicalVerification",
    icon: Briefcase,
    color: "pink",
  },
  {
    id: "training",
    label: "Training Certificate",
    fileKey: "training_file",
    expiryKey: "trainingExpiryDate",
    statusKey: "trainingVerification",
    icon: Briefcase,
    color: "orange",
  },
  {
    id: "eye",
    label: "Eye Test Certificate",
    fileKey: "eye_file",
    expiryKey: "eyeTestExpiryDate",
    statusKey: "eyeTestStatus",
    icon: Eye,
    color: "cyan",
  },
  {
    id: "induction",
    label: "Induction Certificate",
    fileKey: "induction_file",
    dateKey: "inductionDate",
    icon: Briefcase,
    color: "teal",
  },
];

// Static vendors data
export const staticVendors = [
  { id: "1", name: "ABC Transport Services" },
  { id: "2", name: "XYZ Logistics Ltd." },
  { id: "3", name: "City Cabs Pvt. Ltd." },
  { id: "4", name: "Metro Travel Solutions" },
  { id: "5", name: "Express Delivery Network" },
];

export const transformApiToFormData = (driverData) => {
  return {
    name: driverData.name || "",
    code: driverData.code || "",
    email: driverData.email || "",
    mobileNumber: driverData.phone || "",
    gender: driverData.gender || "Male",
    password: "", // Not available from API for security
    dateOfBirth: driverData.date_of_birth || "",
    dateOfJoining: driverData.date_of_joining || "",
    permanentAddress: driverData.permanent_address || "",
    currentAddress: driverData.current_address || "",
    isSameAddress: driverData.permanent_address === driverData.current_address,
    licenseNumber: driverData.license_number || "",
    licenseExpiryDate: driverData.license_expiry_date || "",
    badgeNumber: driverData.badge_number || "",
    badgeExpiryDate: driverData.badge_expiry_date || "",
    inductionDate: driverData.induction_date || "",
    bgvExpiryDate: driverData.bg_expiry_date || "",
    policeExpiryDate: driverData.police_expiry_date || "",
    medicalExpiryDate: driverData.medical_expiry_date || "",
    trainingExpiryDate: driverData.training_expiry_date || "",
    eyeTestExpiryDate: driverData.eye_expiry_date || "",
    alternateGovtId: driverData.alt_govt_id_number || "", // ID Number
    alternateGovtIdType: driverData.alt_govt_id_type || "", // ID Type
    vendor_id: driverData.vendor_id || "", // Added vendor ID
    profileImage: driverData.photo_url
      ? {
          path: driverData.photo_url,
          name: "profile.jpg",
        }
      : null,
    license_file: driverData.license_url
      ? {
          path: driverData.license_url,
          name: "license.pdf",
        }
      : null,
    badge_file: driverData.badge_url
      ? {
          path: driverData.badge_url,
          name: "badge.pdf",
        }
      : null,
    alt_govt_id_file: driverData.alt_govt_id_url
      ? {
          path: driverData.alt_govt_id_url,
          name: "alt_govt_id.pdf",
        }
      : null,
    bgv_file: driverData.bg_verify_url
      ? {
          path: driverData.bg_verify_url,
          name: "bgv.pdf",
        }
      : null,
    police_file: driverData.police_verify_url
      ? {
          path: driverData.police_verify_url,
          name: "police.pdf",
        }
      : null,
    medical_file: driverData.medical_verify_url
      ? {
          path: driverData.medical_verify_url,
          name: "medical.pdf",
        }
      : null,
    training_file: driverData.training_verify_url
      ? {
          path: driverData.training_verify_url,
          name: "training.pdf",
        }
      : null,
    eye_file: driverData.eye_verify_url
      ? {
          path: driverData.eye_verify_url,
          name: "eye.pdf",
        }
      : null,
    induction_file: driverData.induction_url
      ? {
          path: driverData.induction_url,
          name: "induction.pdf",
        }
      : null,
    bgvStatus: driverData.bg_verify_status || "Pending",
    policeVerification: driverData.police_verify_status || "Pending",
    medicalVerification: driverData.medical_verify_status || "Pending",
    trainingVerification: driverData.training_verify_status || "Pending",
    eyeTestStatus: driverData.eye_verify_status || "Pending",
  };
};

// Text fields mapper
export const mapDriverTextFields = (formData) => ({
  name: formData.name,
  code: formData.code,
  email: formData.email,
  phone: formData.mobileNumber,
  gender: formData.gender,
  password: formData.password,
  date_of_joining: formData.dateOfJoining,
  date_of_birth: formData.dateOfBirth,
  permanent_address: formData.permanentAddress,
  current_address: formData.currentAddress,
  license_number: formData.licenseNumber,
  license_expiry_date: formData.licenseExpiryDate,
  badge_number: formData.badgeNumber,
  badge_expiry_date: formData.badgeExpiryDate,
  induction_date: formData.inductionDate,
  bg_expiry_date: formData.bgvExpiryDate,
  police_expiry_date: formData.policeExpiryDate,
  medical_expiry_date: formData.medicalExpiryDate,
  training_expiry_date: formData.trainingExpiryDate,
  eye_expiry_date: formData.eyeTestExpiryDate,
  alt_govt_id_number: formData.alternateGovtId,
  alt_govt_id_type: formData.alternateGovtIdType,
  vendor_id: formData.vendor_id, // Added vendor ID
  bg_verify_status: formData.bgvStatus,
  police_verify_status: formData.policeVerification,
  medical_verify_status: formData.medicalVerification,
  training_verify_status: formData.trainingVerification,
  eye_verify_status: formData.eyeTestStatus,
});

// File fields
export const driverFileFields = [
  "profileImage",
  "license_file",
  "badge_file",
  "alt_govt_id_file",
  "bgv_file",
  "police_file",
  "medical_file",
  "training_file",
  "eye_file",
  "induction_file",
];

// Create FormData for create driver
export const buildDriverFormData = (formData) => {
  const formDataToSend = new FormData();

  const textFields = mapDriverTextFields(formData);

  Object.entries(textFields).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formDataToSend.append(key, value.toString());
    }
  });

  driverFileFields.forEach((field) => {
    if (formData[field] instanceof File) {
      formDataToSend.append(field, formData[field]);
    }
  });

  return formDataToSend;
};

// Build update JSON for edit
export const buildDriverUpdateData = (formData, selectedDriverId) => ({
  driver_id: selectedDriverId,
  ...mapDriverTextFields(formData),
});

// Get vendor name by ID
export const getVendorNameById = (vendorId) => {
  const vendor = staticVendors.find((v) => v.id === vendorId.toString());
  return vendor ? vendor.name : "Unknown Vendor";
};

export const validateField = (name, value, formData) => {
  switch (name) {
    // Personal Details
    case "email":
      return validationRules.validateEmail(value);

    case "mobileNumber":
      return validationRules.validateMobileNumber(value);

    case "dateOfBirth":
      return validationRules.validateDateOfBirth(value);

    // Expiry Dates
    case "drivingLicenseExpiry":
      return validationRules.validateFutureDate(
        value,
        "Driving license expiry"
      );

    case "policeVerificationExpiry":
      return validationRules.validateFutureDate(
        value,
        "Police verification expiry"
      );

    case "medicalCertificateExpiry":
      return validationRules.validateFutureDate(
        value,
        "Medical certificate expiry"
      );

    case "altGovtIdExpiry":
      return validationRules.validateFutureDate(value, "ID expiry date");

    // Document Dates (should be in past)
    case "drivingLicenseDate":
      return validationRules.validatePastDate(
        value,
        "Driving license issue date"
      );

    // Alternate Government ID validation
    case "altGovtIdNumber":
      if (!formData.altGovtIdType || !value) return null;

      switch (formData.altGovtIdType) {
        case "aadhar":
          return validationRules.validateAadhar(value);
        case "pan":
          return validationRules.validatePAN(value);
        case "passport":
          if (!/^[A-Z][0-9]{7}$|^[A-Z]{2}[0-9]{7}$/.test(value)) {
            return "Please enter a valid passport number";
          }
          return null;
        default:
          return null;
      }

    // Required field validation
    case "code":
    case "name":
    case "permanentAddress":
    case "currentAddress":
      if (!value || value.trim() === "") {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      }
      return null;

    // Gender validation
    case "gender":
      if (!value) return "Please select gender";
      return null;

    default:
      return null;
  }
};

// src/config/formConfig.js
export const driverFormConfig = {
  requiredFields: {
    code: true,
    name: true,
    gender: true,
    email: true,
    mobileNumber: true,
    password: true, // only for create mode
    dateOfBirth: true,
    dateOfJoining: true,
    permanentAddress: true,
    currentAddress: true,
    drivingLicenseFile: true,
    aadharFile: true,
    panFile: true,
    policeVerificationFile: true,
    alternateGovtIdFile: true,
  },

  // You can override these per mode
  getRequiredFields: (mode = "create") => {
    const required = { ...driverFormConfig.requiredFields };

    // Remove password validation for edit mode
    if (mode !== "create") {
      delete required.password;
    }

    return required;
  },
};

export const formatBackendError = (err) => {
  logDebug("this is the error", err);

  const data = err?.data || err?.response?.data;

  /* ---------------------------------------------
   * 1️⃣ FastAPI / Pydantic validation errors
   * --------------------------------------------- */
  if (Array.isArray(data?.detail)) {
    const header = "Submission failed due to the following errors:";
    const lines = data.detail.map((d, idx) => {
      const path =
        Array.isArray(d.loc) && d.loc.length > 1
          ? d.loc.slice(1).join(".")
          : "unknown_field";
      const msg = d.msg || "Invalid value";
      return `${idx + 1}. ${path}: ${msg}`;
    });

    return `${header}\n${lines.join("\n")}`;
  }

  /* ---------------------------------------------
   * 2️⃣ Duplicate / business logic errors
   * --------------------------------------------- */
  if (data?.error_code === "DUPLICATE_RESOURCE") {
    let message = data.message || "Duplicate resource detected.";

    const conflicts = data?.details?.conflicting_fields;
    if (conflicts && typeof conflicts === "object") {
      const fields = Object.entries(conflicts)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      message += `\n\nConflicting values:\n${fields}`;
    }

    return message;
  }

  /* ---------------------------------------------
   * 3️⃣ Generic backend message
   * --------------------------------------------- */
  if (typeof data?.message === "string") {
    return data.message;
  }

  /* ---------------------------------------------
   * 4️⃣ Axios / JS error message
   * --------------------------------------------- */
  if (err?.message) {
    return err.message;
  }

  /* ---------------------------------------------
   * 5️⃣ Fallback
   * --------------------------------------------- */
  return "An unknown error occurred while submitting the form.";
};

//  OLD DATA

export const fieldMapping = {
  // Personal / basic info
  name: "name",
  code: "code",
  email: "email",
  password: "password",
  mobileNumber: "phone",
  dateOfBirth: "date_of_birth",
  dateOfJoining: "date_of_joining",
  gender: "gender",
  permanentAddress: "permanent_address",
  currentAddress: "current_address",

  // Verification & expiry
  bgvStatus: "bg_verify_status",
  bgvExpiryDate: "bg_expiry_date", // fixed
  policeVerification: "police_verify_status",
  policeExpiryDate: "police_expiry_date", // fixed
  medicalVerification: "medical_verify_status",
  medicalExpiryDate: "medical_expiry_date", // fixed
  trainingVerification: "training_verify_status",
  trainingExpiryDate: "training_expiry_date", // fixed
  eyeTestStatus: "eye_verify_status",
  eyeTestExpiryDate: "eye_expiry_date", // fixed

  // License & induction
  licenseNumber: "license_number",
  licenseExpiryDate: "license_expiry_date",
  inductionDate: "induction_date",
  badgeNumber: "badge_number",
  badgeExpiryDate: "badge_expiry_date",

  // Govt IDs
  govtIdNumber: "alt_govt_id_number", // fixed
  alternateGovtId: "alt_govt_id_type", // fixed

  // Files
  bgv_file: "bgv_file",
  police_file: "police_file",
  medical_file: "medical_file",
  training_file: "training_file",
  eye_file: "eye_file",
  license_file: "license_file",
  induction_file: "induction_file",
  badge_file: "badge_file",
  alt_govt_id_file: "alt_govt_id_file",
  profileImage: "photo",
};

export const reverseFieldMapping = Object.fromEntries(
  Object.entries(fieldMapping).map(([frontend, backend]) => [backend, frontend])
);

// Backend field -> Frontend field mapping
export const backendToFrontendMapping = {
  // Personal / basic info
  name: "name",
  code: "code",
  email: "email",
  hashed_password: "password",
  phone: "mobileNumber",
  date_of_birth: "dateOfBirth",
  date_of_joining: "date_of_joining",
  gender: "gender",
  permanent_address: "permanent_address",
  current_address: "current_address",

  // Verification & expiry
  bg_verify_status: "bgvStatus",
  bg_expiry_date: "bgvExpiryDate",
  police_verify_status: "policeVerification",
  police_expiry_date: "policeExpiryDate",
  medical_verify_status: "medicalVerification",
  medical_expiry_date: "medicalExpiryDate",
  training_verify_status: "trainingVerification",
  training_expiry_date: "trainingExpiryDate",
  eye_verify_status: "eyeTestStatus",
  eye_expiry_date: "eyeTestExpiryDate",

  // License & induction
  license_number: "licenseNumber",
  license_expiry_date: "licenseExpiryDate",
  induction_date: "inductionDate",
  badge_number: "badgeNumber",
  badge_expiry_date: "badgeExpiryDate",

  // Govt IDs
  alt_govt_id_number: "govtIdNumber",
  alt_govt_id_type: "alternateGovtId",

  // Files (backend gives URLs)
  bgv_file: "bgv_file",
  police_file: "police_file",
  medical_file: "medical_file",
  training_file: "training_file",
  eye_file: "eye_file",
  license_file: "license_file",
  induction_file: "induction_file",
  badge_file: "badge_file",
  alt_govt_id_file: "alt_govt_id_file",
  photo_url: "photo",
};

export const transformBackendToFormData = (backendData) => {
  if (!backendData) return {};

  const transformed = {};
  Object.entries(backendData).forEach(([backendKey, value]) => {
    const frontendKey = backendToFrontendMapping[backendKey];
    if (frontendKey) {
      transformed[frontendKey] = value;
    }
  });

  // Map backend file URLs to frontend file fields
  // Preserve local file if selected, otherwise map backend URL
  transformed.photo =
    transformed.photo instanceof File
      ? transformed.photo
      : backendData.photo_url || null;
  transformed.license_file = backendData.license_url || null;
  transformed.badge_file = backendData.badge_url || null;
  transformed.bgv_file = backendData.bg_verify_url || null;
  transformed.police_file = backendData.police_verify_url || null;
  transformed.medical_file = backendData.medical_verify_url || null;
  transformed.training_file = backendData.training_verify_url || null;
  transformed.eye_file = backendData.eye_verify_url || null;
  transformed.induction_file = backendData.induction_url || null;
  transformed.alt_govt_id_file = backendData.alt_govt_id_url || null;

  return transformed;
};

// Add this to your driverUtility.js file to debug field mapping
export const logFieldMapping = (formData) => {
  console.log("=== FIELD MAPPING DEBUG ===");
  Object.keys(formData).forEach((key) => {
    const backendKey = fieldMapping[key] || key;
    const value = formData[key];
    console.log(
      `Frontend: ${key} -> Backend: ${backendKey} | Value: ${value} | Type: ${typeof value}`
    );
  });
  console.log("=== END FIELD MAPPING ===");
};

// Call this in your handleSubmit before creating FormData
// logFieldMapping(formData);

// Add this function to debug your API_CLIENT setup
// You can call this in your component to check the configuration

const debugAPIClient = () => {
  console.log("🔍 API_CLIENT Debug Information:");
  console.log("Base URL:", API_CLIENT.defaults?.baseURL);
  console.log("Timeout:", API_CLIENT.defaults?.timeout);
  console.log("Headers:", API_CLIENT.defaults?.headers);
  console.log(
    "Auth Token from localStorage:",
    localStorage.getItem("access_token")
  );

  // Check if interceptors are working
  console.log(
    "Request Interceptors:",
    API_CLIENT.interceptors.request.handlers.length
  );
  console.log(
    "Response Interceptors:",
    API_CLIENT.interceptors.response.handlers.length
  );

  // Test a simple GET request to see if connection works
  API_CLIENT.get("/vendors/")
    .then((response) => {
      console.log("✅ Connection test successful:", response.status);
    })
    .catch((error) => {
      console.error("❌ Connection test failed:", error.message);
    });
};

// Call this in your component's useEffect to debug
// useEffect(() => {
//   debugAPIClient();
// }, []);

export { debugAPIClient };
