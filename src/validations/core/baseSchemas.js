// src/validations/core/baseSchemas.js
import { z } from "zod";
import { patterns } from "./patterns";

export const validationSchemas = {
  name: z.string().min(2).max(100).trim(),

  email: z.string().min(1).email().trim().toLowerCase(),

  phone: z
    .string()
    .min(1)
    .refine((val) => patterns.phone.test(val.replace(/\D/g, "")), {
      message: "Phone must be 10 digits",
    }),

  passwordStrong: (isRequired = true) => {
    const baseSchema = z
      .string()
      .regex(patterns.passwordStrong, {
        message:
          "Password must contain 8 chars, uppercase, lowercase, number & special char",
      })
      .max(100);

    if (isRequired) return baseSchema.min(1, "Password is required");

    return z
      .union([z.string().length(0), z.literal(""), z.undefined(), baseSchema])
      .optional();
  },

  passwordSimple: (isRequired = true, minLength = 6) => {
    let schema = z.string();

    if (isRequired) schema = schema.min(1, "Password is required");
    else schema = z.string().optional().or(z.literal(""));

    return schema.superRefine((val, ctx) => {
      if (val && val.length > 0 && val.length < minLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: minLength,
          type: "string",
          inclusive: true,
          message: `Password must be at least ${minLength} characters`,
        });
      }
    });
  },

  vendorId: z.number({
    required_error: "Vendor ID is required",
  }),

  isActive: z
    .union([
      z.boolean(),
      z.string().transform((v) => v === "true"),
      z.number().transform((v) => v === 1),
    ])
    .default(true),

  optionalString: (max = 255) =>
    z.string().max(max).optional().or(z.literal("")),
};
