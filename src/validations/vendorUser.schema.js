// src/validations/vendorUser/vendorUser.update.js

import { z } from "zod";
import { validationSchemas as v } from "./core/baseSchemas";

export const vendorUserCreateSchema = z.object({
  vendor_id: v.vendorId,
  name: v.name,
  email: v.email,
  phone: v.phone,
  password: v.passwordStrong(true),
  is_active: v.isActive.optional().default(true),
});
export const vendorUserUpdateSchema = z
  .object({
    vendor_id: v.vendorId.optional(),
    name: v.name.optional(),
    email: v.email.optional(),
    phone: v.phone.optional(),
    password: v.passwordStrong(false).optional(),
    is_active: v.isActive.optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some((val) => val !== undefined && val !== ""),
    {
      message: "At least one field must be provided for update",
      path: ["general"],
    }
  );
// src/validations/vendorUser/vendorUser.view.js

export const vendorUserViewSchema = z.object({
  vendor_id: v.vendorId,
  name: v.name,
  email: v.email,
  phone: v.phone,
  is_active: v.isActive,
});
