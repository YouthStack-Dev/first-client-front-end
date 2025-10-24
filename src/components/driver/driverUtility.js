import { API_CLIENT } from "../../Api/API_Client";

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
  photo: "photo_url",
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




// Edit driver (PUT)
// export const editDriver = async (vendorId, driverId, formData) => {
//   return API_CLIENT.put(
//     `/vendors/${vendorId}/drivers/${driverId}/`,
//     {formData},
//     { headers: { "Content-Type": "multipart/form-data" } }
//   );
// };

// Add this to your driverUtility.js file to debug field mapping
export const logFieldMapping = (formData) => {
  console.log('=== FIELD MAPPING DEBUG ===');
  Object.keys(formData).forEach(key => {
    const backendKey = fieldMapping[key] || key;
    const value = formData[key];
    console.log(`Frontend: ${key} -> Backend: ${backendKey} | Value: ${value} | Type: ${typeof value}`);
  });
  console.log('=== END FIELD MAPPING ===');
};

// Call this in your handleSubmit before creating FormData
// logFieldMapping(formData);

// Add this function to debug your API_CLIENT setup
// You can call this in your component to check the configuration

const debugAPIClient = () => {
  console.log('🔍 API_CLIENT Debug Information:');
  console.log('Base URL:', API_CLIENT.defaults?.baseURL);
  console.log('Timeout:', API_CLIENT.defaults?.timeout);
  console.log('Headers:', API_CLIENT.defaults?.headers);
  console.log('Auth Token from localStorage:', localStorage.getItem('access_token'));
  
  // Check if interceptors are working
  console.log('Request Interceptors:', API_CLIENT.interceptors.request.handlers.length);
  console.log('Response Interceptors:', API_CLIENT.interceptors.response.handlers.length);
  
  // Test a simple GET request to see if connection works
  API_CLIENT.get('/vendors/')
    .then(response => {
      console.log('✅ Connection test successful:', response.status);
    })
    .catch(error => {
      console.error('❌ Connection test failed:', error.message);
    });
};

// Call this in your component's useEffect to debug
// useEffect(() => {
//   debugAPIClient();
// }, []);

export { debugAPIClient };