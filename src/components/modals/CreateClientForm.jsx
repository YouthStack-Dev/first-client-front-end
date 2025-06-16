import React, { useState } from 'react';
import { X, Building2, User, Shield, Check } from 'lucide-react';
import { FLEET_MODULES } from '../../staticData/Modules';

export const CreateClientForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    allowedModules: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Modules', count: FLEET_MODULES.length },
    { id: 'fleet', name: 'Fleet Management', count: FLEET_MODULES.filter(m => m.category === 'fleet').length },
    { id: 'tracking', name: 'Tracking & GPS', count: FLEET_MODULES.filter(m => m.category === 'tracking').length },
    { id: 'maintenance', name: 'Maintenance', count: FLEET_MODULES.filter(m => m.category === 'maintenance').length },
    { id: 'reports', name: 'Reports & Analytics', count: FLEET_MODULES.filter(m => m.category === 'reports').length },
    { id: 'settings', name: 'Settings', count: FLEET_MODULES.filter(m => m.category === 'settings').length }
  ];

  const filteredModules =
    selectedCategory === 'all'
      ? FLEET_MODULES
      : FLEET_MODULES.filter(module => module.category === selectedCategory);

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
      type: 'client',
      roleId: 'client-role',
      status: 'active'
    });
    setFormData({
      name: '',
      email: '',
      companyName: '',
      contactPerson: '',
      phone: '',
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Client</h2>
              <p className="text-sm text-gray-500">Set up a new client with module permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Client Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="client@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
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
                  {formData.allowedModules.length} of {FLEET_MODULES.length} modules selected
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              {/* Select All */}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {filteredModules.every(m => formData.allowedModules.includes(m.id))
                    ? 'Deselect All'
                    : 'Select All'} in {categories.find(c => c.id === selectedCategory)?.name}
                </button>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {filteredModules.map(module => {
                  const isSelected = formData.allowedModules.includes(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleModuleToggle(module.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
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

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || !formData.email || !formData.companyName || formData.allowedModules.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Client
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
