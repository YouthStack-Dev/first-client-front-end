import React, { useState } from 'react';
import { X, Building2, User, Shield, Check,  } from 'lucide-react';
import { MODULES } from '../../staticData/Modules';

export const CreateCompanyForm = ({
  isOpen,
  onClose,
  onSubmit,
  parentAllowedModules = MODULES.map(m => m.id),
  isDirectCreation = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    address: '',
    allowedModules: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const availableModules = MODULES.filter(module =>
    parentAllowedModules.includes(module.id)
  );

  const categories = [
    { id: 'all', name: 'All Modules', count: availableModules.length },
    { id: 'employee', name: 'Employee Management', count: availableModules.filter(m => m.category === 'employee').length },
    { id: 'transport', name: 'Transport', count: availableModules.filter(m => m.category === 'transport').length },
    { id: 'routes', name: 'Routes', count: availableModules.filter(m => m.category === 'routes').length },
    { id: 'analytics', name: 'Analytics', count: availableModules.filter(m => m.category === 'analytics').length },
    { id: 'settings', name: 'Settings', count: availableModules.filter(m => m.category === 'settings').length }
  ].filter(cat => cat.count > 0);

  const filteredModules = selectedCategory === 'all'
    ? availableModules
    : availableModules.filter(module => module.category === selectedCategory);

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      allowedModules: prev.allowedModules.includes(moduleId)
        ? prev.allowedModules.filter(id => id !== moduleId)
        : [...prev.allowedModules, moduleId]
    }));
  };

  const handleSelectAll = () => {
    const moduleIds = filteredModules.map(m => m.id);
    const allSelected = moduleIds.every(id => formData.allowedModules.includes(id));

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        allowedModules: prev.allowedModules.filter(id => !moduleIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        allowedModules: [...new Set([...prev.allowedModules, ...moduleIds])]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: 'company',
      status: 'active',
      clientId: isDirectCreation ? 'direct-super-admin' : 'parent-client-id'
    });
    setFormData({
      name: '',
      email: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      address: '',
      allowedModules: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Company</h2>
              <p className="text-sm text-gray-500">
                {isDirectCreation
                  ? 'Set up a new company directly under super admin'
                  : 'Set up a new company with module permissions'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Company Info */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="company@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Company address"
                  />
                </div>
              </div>
            </div>

            {/* Module Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-600" />
                  Module Permissions
                </h3>
                <div className="text-sm text-gray-500">
                  {formData.allowedModules.length} of {availableModules.length} modules selected
                </div>
              </div>

              {!isDirectCreation && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Shield className="w-4 h-4 inline mr-1" />
                    You can only assign modules that are available to the parent client.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {filteredModules.every(m => formData.allowedModules.includes(m.id))
                    ? 'Deselect All'
                    : 'Select All'} in {categories.find(c => c.id === selectedCategory)?.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {filteredModules.map(module => {
                  const isSelected = formData.allowedModules.includes(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleModuleToggle(module.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {module.name}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !formData.name || !formData.email || !formData.companyName || formData.allowedModules.length === 0
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Company
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
