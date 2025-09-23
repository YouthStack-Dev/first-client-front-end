import { employeeSchema, personalInfoSchema, addressInfoSchema } from './employeeSchema';

export const validateEmployeeForm = (formData) => {
  try {
    const result = employeeSchema.parse(formData);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    throw error;
  }
};

export const validatePersonalInfo = (formData) => {
  try {
    const result = personalInfoSchema.parse(formData);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    throw error;
  }
};

export const validateAddressInfo = (formData) => {
  try {
    const result = addressInfoSchema.parse(formData);
    return { success: true, data: null, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    throw error;
  }
};

// Helper to format form data for validation
export const formatFormDataForValidation = (formData) => {
  return {
    ...formData,
    departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : undefined,
    roleId: formData.roleId ? parseInt(formData.roleId, 10) : undefined,
    latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
    longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
  };
};