import { z } from "zod";

export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^[1-9]\d{9}$/.test(val), {
    message: "Phone number must be exactly 10 digits and cannot start with 0",
  })
  .or(z.literal(""));

// Phone number must be exactly 10 digits and cannot start with 0
export const requiredPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^[1-9]\d{9}$/,
    "Phone number must be exactly 10 digits and cannot start with 0"
  );

// Alternate phone (optional) with same rule

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(100, "Email must be less than 100 characters");

export const requiredStringSchema = z.string().min(1, "This field is required");

export const optionalStringSchema = z.string().optional().or(z.literal(""));

// Personal Info Schema - Updated field names
export const personalInfoSchema = z
  .object({
    name: z
      .string()
      .min(1, "Employee name is required")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

    employee_code: z
      .string()
      .min(1, "Employee ID is required")
      .max(50, "Employee ID must be less than 50 characters")
      .regex(
        /^[a-zA-Z0-9_-]*$/,
        "Employee ID can only contain letters, numbers, hyphens, and underscores"
      ),

    email: emailSchema,

    gender: z
      .enum(["Male", "Female", "Other", ""], {
        errorMap: () => ({ message: "Gender is required" }),
      })
      .refine((val) => val !== "", "Gender is required"),

    phone: requiredPhoneSchema,

    alternate_phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{10}$/.test(val),
        "Alternate phone number must be exactly 10 digits"
      ),

    special_needs: z
      .enum(["none", "Wheelchair", "Pregnancy", ""], {
        errorMap: () => ({ message: "Invalid special need selection" }),
      })
      .default("none"),

    special_needs_start_date: z.string().nullable().optional(),
    special_needs_end_date: z.string().nullable().optional(),

    team_id: z.union([
      z.number().positive("Department is required"),
      z.string().min(1, "Department is required"),
      z
        .string()
        .refine(
          (val) => !isNaN(parseInt(val, 10)),
          "Department must be a valid number"
        ),
    ]),
  })
  .refine(
    (data) => {
      // Check if alternate_phone is different from phone
      if (
        data.alternate_phone &&
        data.phone &&
        data.alternate_phone === data.phone
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Alternate phone number cannot be same as primary phone number",
      path: ["alternate_phone"],
    }
  )
  .refine(
    (data) => {
      if (
        data.special_needs &&
        data.special_needs !== "none" &&
        data.special_needs !== ""
      ) {
        return data.special_needs_start_date && data.special_needs_end_date;
      }
      return true;
    },
    {
      message:
        "Start date and end date are required when special need is selected",
      path: ["special_needs_start_date"],
    }
  )
  .refine(
    (data) => {
      if (
        data.special_needs &&
        data.special_needs !== "none" &&
        data.special_needs !== ""
      ) {
        if (data.special_needs_start_date && data.special_needs_end_date) {
          const startDate = new Date(data.special_needs_start_date);
          const endDate = new Date(data.special_needs_end_date);
          return endDate >= startDate;
        }
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["special_needs_end_date"],
    }
  );

// Address Info Schema
export const addressInfoSchema = z.object({
  address: requiredStringSchema,
  landmark: optionalStringSchema,
  latitude: z.union([
    z.number().min(-90).max(90, "Valid latitude is required"),
    z
      .string()
      .refine((val) => !isNaN(parseFloat(val)), "Valid latitude is required"),
  ]),
  longitude: z.union([
    z.number().min(-180).max(180, "Valid longitude is required"),
    z
      .string()
      .refine((val) => !isNaN(parseFloat(val)), "Valid longitude is required"),
  ]),
  distance_from_company: z.union([z.number(), z.string(), z.null()]).optional(),
  office: optionalStringSchema,
});

// Complete Employee Schema
export const employeeSchema = personalInfoSchema
  .merge(addressInfoSchema)
  .extend({
    subscribe_via_email: z.boolean().optional().default(false),
    subscribe_via_sms: z.boolean().optional().default(false),
  });

// Validation functions
export const validatePersonalInfo = (formData) => {
  try {
    const dataToValidate = {
      ...formData,
      alternate_phone: formData.alternate_phone || undefined,
      special_needs_start_date: formData.special_needs_start_date || null,
      special_needs_end_date: formData.special_needs_end_date || null,
    };

    console.log("Validating personal info:", dataToValidate);
    personalInfoSchema.parse(dataToValidate);
    return { isValid: true, errors: {} };
  } catch (error) {
    console.error("Validation error details:", error);
    if (error instanceof z.ZodError) {
      const errors = {};
      // Use error.issues instead of error.errors
      error.issues.forEach((err) => {
        const path = err.path[0];
        // Only keep the first error for each field
        if (!errors[path]) {
          errors[path] = err.message;
          console.log(`Field: ${path}, Error: ${err.message}`);
        }
      });
      return { isValid: false, errors };
    }
    // Log the actual error for debugging
    console.error("Non-Zod validation error:", error);
    return {
      isValid: false,
      errors: { general: `Validation failed: ${error.message}` },
    };
  }
};

export const validateAddressInfo = (formData) => {
  try {
    console.log("Validating address info:", formData);
    addressInfoSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    console.error("Address validation error details:", error);
    if (error instanceof z.ZodError) {
      const errors = {};
      // Use error.issues instead of error.errors
      error.issues.forEach((err) => {
        const path = err.path[0];
        if (!errors[path]) {
          errors[path] = err.message;
          console.log(`Field: ${path}, Error: ${err.message}`);
        }
      });
      return { isValid: false, errors };
    }
    console.error("Non-Zod validation error:", error);
    return {
      isValid: false,
      errors: { general: `Validation failed: ${error.message}` },
    };
  }
};

export const validateEmployeeForm = (formData) => {
  try {
    console.log("Validating complete employee form:", formData);
    employeeSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    console.error("Employee form validation error details:", error);
    if (error instanceof z.ZodError) {
      const errors = {};
      // Use error.issues instead of error.errors
      error.issues.forEach((err) => {
        const path = err.path[0];
        if (!errors[path]) {
          errors[path] = err.message;
          console.log(`Field: ${path}, Error: ${err.message}`);
        }
      });
      return { isValid: false, errors };
    }
    console.error("Non-Zod validation error:", error);
    return {
      isValid: false,
      errors: { general: `Validation failed: ${error.message}` },
    };
  }
};

// Helper to format form data for validation
export const formatFormDataForValidation = (formData) => {
  return {
    ...formData,
    team_id: formData.team_id ? parseInt(formData.team_id, 10) : undefined,
    latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
    longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
  };
};
