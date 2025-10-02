import React, { useState, useEffect } from 'react';
import { X, Building2, Lock, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissionsThunk } from '../redux/features/Permissions/permissionsThunk';

const initialFormState = {
  company: { tenant_id: '', name: '', address: '', is_active: true },
  employee_email: '',
  employee_phone: '',
  employee_password: '',
  permissions: {}
};

const EntityModal = ({ isOpen, onClose, entityType = 'company', entityData, onSubmit, mode = 'create' }) => {
  const dispatch = useDispatch();
  const { permissions, loading, fetched } = useSelector(state => state.permissions);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Fetch permissions if not already fetched
  useEffect(() => {
    if (isOpen && !fetched) dispatch(fetchPermissionsThunk());
  }, [isOpen, fetched, dispatch]);

  // Reset or prefill form when modal opens
  useEffect(() => {
    if (!isOpen || permissions.length === 0) 
      return;

    const groupedPermissions = {};
    permissions.forEach(p => {
      if (!groupedPermissions[p.module]) groupedPermissions[p.module] = {};
      groupedPermissions[p.module][p.action] = {
        ...p,
        is_active:
          mode === 'edit' && entityData?.permissions
            ? !!entityData.permissions.find(
                ep => ep.module === p.module && ep.action === p.action
              )
            : false
      };
    });

    if (mode === 'edit' && entityData) {
      setFormData({
        company: {
          tenant_id: entityData.company?.tenant_id || '',
          name: entityData.company?.name || '',
          address: entityData.company?.address || '',
          is_active: entityData.company?.is_active ?? true
        },
        employee_email: entityData.employee_email || '',
        employee_phone: entityData.employee_phone || '',
        employee_password: '',
        permissions: groupedPermissions
      });
    } else {
      setFormData({ ...initialFormState, permissions: groupedPermissions });
    }
  }, [entityData, permissions, isOpen, mode]);

  // ✅ Always reset when modal closes (fixes the "stale data" bug)
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (section, field, value) => {
    if (section === 'company') {
      setFormData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: { ...prev.permissions[module][action], is_active: value }
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate company fields
    Object.entries(formData.company).forEach(([key, value]) => {
      if (!value && key !== 'is_active') newErrors[key] = `${key} is required`;
    });

    // Validate employee fields
    ['employee_email', 'employee_phone'].forEach(key => {
      if (!formData[key]) newErrors[key] = `${key} is required`;
    });

    // Password validation
    if (mode === 'create') {
      const password = formData.employee_password;
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!password) newErrors.employee_password = 'Password is required';
      else if (!passwordRegex.test(password))
        newErrors.employee_password =
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const preparePayload = () => {
  const permission_ids = [];
  Object.values(formData.permissions).forEach(module => {
    Object.values(module).forEach(action => {
      if (action.is_active && action.permission_id) permission_ids.push(action.permission_id);
    });
  });

  return {
    tenant_id: formData.company.tenant_id,
    name: formData.company.name,
    address: formData.company.address,
    is_active: formData.company.is_active,
    employee_email: formData.employee_email,
    employee_phone: formData.employee_phone,
    employee_password: formData.employee_password,
    permission_ids: [...new Set(permission_ids)]
  };
};


  const handleSubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = preparePayload();
    // console.log('[EntityModal] Submitting payload:', payload);
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[80vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'create' ? 'Create' : 'Edit'} {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['tenant_id', 'name', 'address'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace(/_/g, ' ').replace('tenant id', 'Tenant ID')} *
                </label>
                <input
                  type="text"
                  value={formData.company[field] || ''}
                  onChange={e => handleInputChange('company', field, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            {['employee_email', 'employee_phone', 'employee_password'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace(/_/g, ' ').replace('employee ', 'Employee ')} {mode === 'create' ? '*' : ''}
                </label>
                <input
                  type={field.includes('password') ? 'password' : 'text'}
                  value={formData[field] || ''}
                  onChange={e => handleInputChange('employee', field, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            <div className="flex items-center space-x-2 mt-6 md:mt-0">
              <input
                type="checkbox"
                checked={formData.company.is_active}
                onChange={e => handleInputChange('company', 'is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Is Active</span>
            </div>
          </div>

          {/* Permissions */}
          {permissions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" /> Permissions
              </h3>
              {loading ? (
                <p>Loading permissions...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(formData.permissions).map(([module, actions]) => (
                    <div key={module} className="bg-gray-50 rounded-lg p-3">
                      <label className="block font-medium text-gray-800 mb-2">{module}</label>
                      <div className="space-y-2">
                        {Object.entries(actions).map(([action, data]) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={data.is_active || false}
                              onChange={e => handlePermissionChange(module, action, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" /> {mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityModal;