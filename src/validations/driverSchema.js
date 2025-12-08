export const driverPersonalSchema = {
  name: { required: true, minLength: 2 },
  mobileNumber: { required: true, pattern: /^\d{10}$/ },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { requiredIfCreate: true },
  code: { required: true },
  gender: { required: true },
  dateOfBirth: { required: true, minAge: 18 },
};

export const driverDocumentSchema = {
  licenseNumber: { required: true },
  licenseExpiryDate: { required: true, futureDate: true },
  badgeNumber: { required: true },
  badgeExpiryDate: { required: true, futureDate: true },
  inductionDate: { required: true },

  bgvExpiryDate: { required: true, futureDate: true },
  policeExpiryDate: { required: true, futureDate: true },
  medicalExpiryDate: { required: true, futureDate: true },
  trainingExpiryDate: { required: true, futureDate: true },
  eyeTestExpiryDate: { required: true, futureDate: true },

  govtIdNumber: { required: true },
  alternateGovtId: { required: true },
};
