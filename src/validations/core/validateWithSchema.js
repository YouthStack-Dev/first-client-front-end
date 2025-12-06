// src/validations/core/validateWithSchema.js

export const validateWithSchema = (schema, data) => {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed, errors: null };
  } catch (error) {
    const errors = {};
    error?.issues?.forEach((i) => {
      const field = i.path.join(".") || "general";
      errors[field] = i.message;
    });
    return { success: false, data: null, errors };
  }
};
