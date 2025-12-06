// src/validations/core/formValidator.js
import { validateWithSchema } from "./validateWithSchema";

export const createFormValidator = (schema) => {
  return (formData) => {
    const result = validateWithSchema(schema, formData);

    return {
      isValid: result.success,
      errors: result.errors || {},
      validatedData: result.data,
    };
  };
};
