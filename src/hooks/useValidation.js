import { useState, useCallback } from "react";
import { validationPolicies } from "../validations/core/validationPolicies";
import { createFormValidator } from "../validations/core/formValidator";

export const useValidation = (entity, mode = "create") => {
  const [errors, setErrors] = useState({});

  const getSchema = useCallback(() => {
    if (!validationPolicies[entity]) {
      console.error(`No validation policy found for entity: ${entity}`);
      return null;
    }

    if (!validationPolicies[entity][mode]) {
      console.error(
        `No validation schema found for mode: ${mode} in entity: ${entity}`
      );
      return null;
    }

    return validationPolicies[entity][mode];
  }, [entity, mode]);

  const validateForm = useCallback(
    (formData) => {
      const schema = getSchema();

      if (!schema) {
        return {
          isValid: false,
          errors: { general: "Validation schema not found" },
          validatedData: null,
        };
      }

      const validator = createFormValidator(schema);
      const result = validator(formData);

      setErrors(result.errors);
      return result;
    },
    [getSchema]
  );

  const clearError = useCallback((fieldName) => {
    if (fieldName) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    } else {
      setErrors({});
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors,
    setErrors,
  };
};
