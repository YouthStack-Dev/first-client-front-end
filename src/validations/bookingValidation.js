// bookingValidation.js
import { z } from "zod";

export const bookingSchema = z.object({
  employee_id: z
    .number({ invalid_type_error: "Employee ID must be a number" })
    .int("Employee ID must be an integer")
    .nonnegative("Employee ID is required"),
  booking_dates: z
    .array(z.string({ invalid_type_error: "Date must be a string" }))
    .min(1, "At least one booking date is required"),
  shift_id: z
    .number({ invalid_type_error: "Shift ID must be a number" })
    .int("Shift ID must be an integer")
    .nonnegative("Shift ID is required"),
});
