// src/validations/driverValidation.js
import { z } from "zod";
import { patterns } from "./core/patterns";

export const driverSchema = (mode = "create") => {
  // Create base schema without superRefine initially
  const baseFields = {
    code: z.string().min(1, "Driver code is required"),
    name: z.string().min(1, "Full name is required"),
    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .regex(patterns.email, "Invalid email format"),
    mobileNumber: z
      .string()
      .min(1, "Mobile number is required")
      .regex(patterns.phone, "Mobile number must be 10 digits"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => {
        const dob = new Date(val);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        // Adjust for month/day
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        return (
          age > 18 ||
          (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
        );
      }, "Driver must be at least 18 years old"),
    dateOfJoining: z.string().min(1, "Date of joining is required"),
    permanentAddress: z.string().min(1, "Permanent address is required"),
    currentAddress: z.string().min(1, "Current address is required"),
    isSameAddress: z.boolean().optional(),
    vendor_id: z.string().optional(),

    // Document fields
    drivingLicenseNumber: z.string().optional(),
    drivingLicenseExpiry: z.string().optional(),
    aadharNumber: z.string().optional(),
    panNumber: z.string().optional(),
    policeVerificationDate: z.string().optional(),
    policeVerificationStatus: z.string().optional(),
    alternateGovtIdType: z.string().optional(),
    alternateGovtIdNumber: z.string().optional(),

    // File fields - will be validated conditionally
    drivingLicenseFile: z.any().optional(),
    aadharFile: z.any().optional(),
    panFile: z.any().optional(),
    policeVerificationFile: z.any().optional(),
    alternateGovtIdFile: z.any().optional(),
  };

  // Add password field for create mode
  if (mode === "create") {
    baseFields.password = z
      .string()
      .min(1, "Password is required")
      .regex(
        patterns.passwordStrong,
        "Password must be at least 8 characters with uppercase, lowercase, number and special character"
      );
  }

  // Create the base schema
  let schema = z.object(baseFields);

  // Add file validation refinement
  schema = schema.superRefine((data, ctx) => {
    const validateFileField = (field, fieldName) => {
      const file = data[field];
      const isFileObject = file instanceof File;
      const isStringPath = typeof file === "string" && file.trim().length > 0;
      const isFileList = file && file.length > 0;

      if (!isFileObject && !isStringPath && !isFileList) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldName} is required`,
          path: [field],
        });
      }
    };

    validateFileField("drivingLicenseFile", "Driving license file");
    validateFileField("aadharFile", "Aadhar file");
    validateFileField("panFile", "PAN file");
    validateFileField("policeVerificationFile", "Police verification file");
    validateFileField("alternateGovtIdFile", "Alternate govt ID file");
  });

  return schema;
};

export const validateDriverForm = (formData, mode = "create") => {
  const schema = driverSchema(mode);

  // Use safeParse for safer validation
  const result = schema.safeParse(formData);

  if (result.success) {
    return { success: true, errors: null };
  }

  // Extract errors
  const errors = {};
  if (result.error && result.error.errors) {
    result.error.errors.forEach((err) => {
      const field = err.path && err.path[0];
      if (field) {
        errors[field] = err.message;
      }
    });
  }

  return { success: false, errors };
};
