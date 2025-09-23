import { API_CLIENT } from "../../Api/API_Client";

 export const fieldMapping = {


    password: "hashed_password",        // backend expects hashed_password
    mobileNumber: "mobile_number",
    city: "city",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    alternateMobileNumber: "alternate_mobile_number",
    permanentAddress: "permanent_address",
    currentAddress: "current_address",
    // Verification & expiry mappings
    bgvStatus: "bgv_status",
    bgvExpiryDate: "bgv_date",
    policeVerification: "police_verification_status",
    policeExpiryDate: "police_verification_date",
    medicalVerification: "medical_verification_status",
    medicalExpiryDate: "medical_verification_date",
    trainingVerification: "training_verification_status",
    trainingExpiryDate: "training_verification_date",
    eyeTestStatus: "eye_test_verification_status",
    eyeTestExpiryDate: "eye_test_verification_date",
  
    // License & induction
    licenseNumber: "license_number",
    licenseExpiryDate: "license_expiry_date",
    inductionDate: "induction_date",
    badgeNumber: "badge_number",
    badgeExpiryDate: "badge_expiry_date",
  
    // Govt IDs
    govtIdNumber: "alternate_govt_id",
    alternateGovtId: "alternate_govt_id_doc_type",
  
    // Files (same logic applies)
    bgvDocument: "bgv_doc_file",
    policeDocument: "police_verification_doc_file",
    medicalDocument: "medical_verification_doc_file",
    trainingDocument: "training_verification_doc_file",
    eyeTestDocument: "eye_test_verification_doc_file",
    licenseDocument: "license_doc_file",
    inductionDocument: "induction_doc_file",
    badgeDocument: "badge_doc_file",
    govtIdDocument: "alternate_govt_id_doc_file",
    profileImage: "photo_image",
  };
 
  export const reverseFieldMapping = Object.fromEntries(
    Object.entries(fieldMapping).map(([frontend, backend]) => [backend, frontend])
  );


  // Backend field -> Frontend field mapping
export const backendToFrontendMapping = {
  name:"name",
  email: "email",
  driver_code: "driver_code",
  hashed_password: "password",
  mobile_number: "mobileNumber",
  city: "city",
  date_of_birth: "dateOfBirth",
  gender: "gender",
  alternate_mobile_number: "alternateMobileNumber",
  permanent_address: "permanentAddress",
  current_address: "currentAddress",

  // Verification & expiry
  bgv_status: "bgvStatus",
  bgv_date: "bgvExpiryDate",
  police_verification_status: "policeVerification",
  police_verification_date: "policeExpiryDate",
  medical_verification_status: "medicalVerification",
  medical_verification_date: "medicalExpiryDate",
  training_verification_status: "trainingVerification",
  training_verification_date: "trainingExpiryDate",
  eye_test_verification_status: "eyeTestStatus",
  eye_test_verification_date: "eyeTestExpiryDate",

  // License & induction
  license_number: "licenseNumber",
  license_expiry_date: "licenseExpiryDate",
  induction_date: "inductionDate",
  badge_number: "badgeNumber",
  badge_expiry_date: "badgeExpiryDate",

  // Govt IDs
  alternate_govt_id: "govtIdNumber",
  alternate_govt_id_doc_type: "alternateGovtId",

  // Docs (urls from backend, you can show in view mode)
  bgv_doc_url: "bgvDocument",
  police_verification_doc_url: "policeDocument",
  medical_verification_doc_url: "medicalDocument",
  training_verification_doc_url: "trainingDocument",
  eye_test_verification_doc_url: "eyeTestDocument",
  license_doc_url: "licenseDocument",
  induction_doc_url: "inductionDocument",
  badge_doc_url: "badgeDocument",
  alternate_govt_id_doc_url: "govtIdDocument",
  photo_url: "profileImage",
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

  return transformed;
};



// Edit driver (PUT)
export const editDriver = async (vendorId, driverId, formData) => {
  return API_CLIENT.put(
    `/vendors/${vendorId}/drivers/${driverId}/`,
    {formData},
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

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