import React, { useState, useEffect } from 'react';
import { X, Building2, Truck, User, Lock, Save, Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModulesThunk } from '../redux/features/Permissions/permissionsThunk';

const EntityModal = ({
  isOpen,
  onClose,
  entityType,
  entityData,
  onSubmit,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  const { modules, loading } = useSelector(state => state.modules);

  const [formData, setFormData] = useState({
    company: {},
    vendor: {},
    adminUser: {},
    permissions: []
  });
  const [errors, setErrors] = useState({});
const [hasFetchedModules, setHasFetchedModules] = useState(false);

useEffect(() => {
  if (isOpen && !hasFetchedModules && !loading && mode === 'create') {
    dispatch(fetchModulesThunk());
    setHasFetchedModules(true); // mark that fetch was attempted
  }
}, [isOpen, hasFetchedModules, loading, dispatch, mode]);

  // Initialize form data when modal opens or entityData changes
useEffect(() => {
  if (!isOpen) return;

  if (mode === 'edit' && entityData) {
    setFormData({
      company: {
        ...entityData,
        imageUrl: entityData.logo || '',       
        websiteUrl: entityData.website || ''  
      },
      vendor: {
        ...entityData.vendor,
        imageUrl: entityData.vendor?.logo || '',
        websiteUrl: entityData.vendor?.website || ''
      },
      adminUser: {
        name: entityData.adminUser?.name || '',
        email: entityData.adminUser?.email || '',
        phone: entityData.adminUser?.phone || '',
        password: '' // keep blank on edit
      },
      permissions: entityData.permissions || [] // optional
    });
  } else if (mode === 'create' && modules.length > 0) {
    setFormData({
      company: { imageUrl: '', websiteUrl: '' },
      vendor: { imageUrl: '', websiteUrl: '' },
      adminUser: {},
      permissions: modules.map(module => ({
        moduleKey: module.key,
        canRead: false,
        canWrite: false,
        canDelete: false
      }))
    });
  }
}, [entityData, modules, isOpen, mode]);


  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handlePermissionChange = (moduleKey, permissionType, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.moduleKey === moduleKey ? { ...p, [permissionType]: value } : p
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const entityFields =
      entityType === 'company'
        ? ['name', 'email', 'phone', 'address']
        : ['name', 'email', 'phone', 'address', 'licenseNumber', 'gstNumber'];

    entityFields.forEach(field => {
      if (!formData[entityType]?.[field]) {
        newErrors[`${entityType}.${field}`] = `${field.replace(/_/g, ' ')} is required`;
      }
    });

    const adminFields = ['name', 'email', 'password', 'phone'];
    adminFields.forEach(field => {
      if (!formData.adminUser?.[field] && mode === 'create') {
        newErrors[`adminUser.${field}`] = `${field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  const renderFields = (section, fields, isAdmin = false) =>
    fields.map(field => (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isAdmin
            ? field.charAt(0).toUpperCase() + field.slice(1)
            : field === 'licenseNumber'
            ? 'License Number'
            : field === 'gstNumber'
            ? 'GST Number'
            : field.charAt(0).toUpperCase() + field.slice(1)}{' '}
          {mode === 'create' ? '*' : ''}
        </label>
        <input
          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
          value={formData[section]?.[field] || ''}
          onChange={e => handleInputChange(section, field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors[`${section}.${field}`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`Enter ${isAdmin ? 'admin ' : ''}${field}`}
        />
        {errors[`${section}.${field}`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`${section}.${field}`]}</p>
        )}
      </div>
    ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            {entityType === 'company' ? (
              <Building2 className="w-6 h-6 text-blue-600" />
            ) : (
              <Truck className="w-6 h-6 text-green-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'create' ? 'Create' : 'Edit'} {entityType === 'company' ? 'Company' : 'Vendor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company/Vendor Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-lg font-medium text-gray-800 md:col-span-2 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {entityType === 'company' ? 'Company' : 'Vendor'} Details
            </h3>
            {renderFields(entityType, ['name', 'email', 'phone', 'address'])}
            {entityType === 'vendor' && renderFields('vendor', ['licenseNumber', 'gstNumber'])}

            {/* Website URL + Image Upload Side by Side */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {entityType === 'company' ? 'Company' : 'Vendor'} Website URL
                </label>
                <input
                  type="url"
                  value={formData[entityType]?.websiteUrl || ''}
                  onChange={(e) => handleInputChange(entityType, 'websiteUrl', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  placeholder="https://example.com"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {entityType === 'company' ? 'Company' : 'Vendor'} Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      handleInputChange(entityType, 'imageUrl', url);
                    }
                  }}
                  className="w-full mb-2"
                />
                {formData[entityType]?.imageUrl && (
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src={formData[entityType].imageUrl}
                      alt={`${entityType} preview`}
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange(entityType, 'imageUrl', '')}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
             <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData[entityType]?.isActive ?? false} 
                    onChange={(e) => handleInputChange(entityType, "isActive", e.target.checked)}
                    className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-base font-medium text-gray-800">
                    {formData[entityType]?.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
          </div>

          {/* Admin User */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-lg font-medium text-gray-800 md:col-span-2 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Admin User Details
            </h3>
            {renderFields('adminUser', ['name', 'email', 'phone'], true)}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {mode === 'create' ? '*' : ''}
              </label>
              <input
                type="password"
                value={formData.adminUser?.password || ''}
                onChange={e => handleInputChange('adminUser', 'password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  mode === 'create' && errors['adminUser.password'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
              />
              {mode === 'create' && errors['adminUser.password'] && (
                <p className="text-red-500 text-sm mt-1">{errors['adminUser.password']}</p>
              )}
            </div>
          </div>

          {/* Permissions (Create Only) */}
          {mode === 'create' && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Permissions
              </h3>
              {loading ? (
                <p>Loading modules...</p>
              ) : modules.length === 0 ? (
                <p>No modules found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map(module => {
                    const permission = formData.permissions.find(p => p.moduleKey === module.key) || {};
                    return (
                      <div key={module.key} className="bg-gray-50 rounded-lg p-3">
                        <label className="block font-medium text-gray-800 mb-2">{module.name}</label>
                        <div className="space-y-2">
                          {['canRead', 'canWrite', 'canDelete'].map(permType => (
                            <label key={permType} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={permission[permType] || false}
                                onChange={e =>
                                  handlePermissionChange(module.key, permType, e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {permType.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {mode === 'create' ? (
                <><Save className="w-4 h-4 mr-2" />Create {entityType === 'company' ? 'Company' : 'Vendor'}</>
              ) : (
                <><Edit className="w-4 h-4 mr-2" />Update {entityType === 'company' ? 'Company' : 'Vendor'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityModal;
