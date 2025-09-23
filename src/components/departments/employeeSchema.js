import { z } from 'zod';

// Base schemas for reusable validation
export const phoneSchema = z.string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  .optional()
  .or(z.literal(''));

export const requiredPhoneSchema = z.string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');

export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const requiredStringSchema = z.string().min(1, 'This field is required');

export const optionalStringSchema = z.string().optional().or(z.literal(''));

// Main employee schema
export const employeeSchema = z.object({
  // Personal Info
  name: requiredStringSchema,
  userId: requiredStringSchema,
  email: emailSchema,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Gender is required' })
  }),
  phone: requiredPhoneSchema,
  alternativePhone: phoneSchema.refine(
    (val, ctx) => {
      if (val && val === ctx.parent.phone) {
        return false;
      }
      return true;
    },
    { message: 'Alternate Phone No cannot be same as primary' }
  ),
  
  // Department & Role
  departmentId: z.number().min(1, 'Department is required'),
  roleId: z.number().optional().nullable(),
  
  // Special Needs
  specialNeed: z.string().optional().nullable(),
  specialNeedStart: z.string().optional().nullable(),
  specialNeedEnd: z.string().optional().nullable(),
  
  // Address Info
  address: requiredStringSchema,
  landmark: optionalStringSchema,
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  
  // Emergency Info
  bloodGroup: optionalStringSchema,
  emergencyPhone: phoneSchema,
  emergencyContact: optionalStringSchema,
}).superRefine((data, ctx) => {
  // Custom validation for special need dates
  if (data.specialNeed && data.specialNeed !== 'none') {
    if (!data.specialNeedStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is required when special need is selected',
        path: ['specialNeedStart'],
      });
    }
    if (!data.specialNeedEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required when special need is selected',
        path: ['specialNeedEnd'],
      });
    }
  }

  // Custom validation for location
  if (!data.latitude || !data.longitude) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select a location on the map',
      path: ['location'],
    });
  }
});

// Schema for personal info only (for step-by-step validation)
export const personalInfoSchema = employeeSchema.pick({
  name: true,
  userId: true,
  email: true,
  gender: true,
  phone: true,
  alternativePhone: true,
  departmentId: true,
  roleId: true,
  specialNeed: true,
  specialNeedStart: true,
  specialNeedEnd: true,
});

// Schema for address info only
export const addressInfoSchema = employeeSchema.pick({
  address: true,
  landmark: true,
  latitude: true,
  longitude: true,
});

