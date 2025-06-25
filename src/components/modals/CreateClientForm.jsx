import React, { useState } from 'react';
import { X, Building2, User, Shield, Check, ChevronDown, ChevronUp, Search, Eye, EyeOff, Lock } from 'lucide-react';
import { MODULES } from '../../staticData/Modules';

export const CreateClientForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    allowedModules: [],
    password: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState(new Set());

  // Calculate category counts including submodules
  const categories = [
    { 
      id: 'all', 
      name: 'All Modules', 
      count: MODULES.reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    {
      id: 'fleet',
      name: 'Fleet Management',
      count: MODULES.filter(m => m.category === 'fleet').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'tracking',
      name: 'Tracking & GPS',
      count: MODULES.filter(m => m.category === 'tracking').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      count: MODULES.filter(m => m.category === 'maintenance').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      count: MODULES.filter(m => m.category === 'reports').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'settings',
      name: 'Settings',
      count: MODULES.filter(m => m.category === 'settings').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-gray-50 text-gray-700 border-gray-200'
    },
    {
      id: 'users',
      name: 'Users',
      count: MODULES.filter(m => m.category === 'users').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'organization',
      name: 'Organization',
      count: MODULES.filter(m => m.category === 'organization').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      count: MODULES.filter(m => m.category === 'scheduling').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'vendor',
      name: 'Vendors',
      count: MODULES.filter(m => m.category === 'vendor').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      id: 'contracts',
      name: 'Contracts',
      count: MODULES.filter(m => m.category === 'contracts').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'security',
      name: 'Security',
      count: MODULES.filter(m => m.category === 'security').reduce((sum, m) => sum + 1 + m.submodules.length, 0),
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
  ];

  // Filter modules by category and search term
  const filteredModules = MODULES.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.submodules.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    return matchesCategory && matchesSearch;
  });

  // Get all module and submodule IDs for the selected category
  const getAllModuleIds = () => {
    return filteredModules.reduce((ids, module) => {
      const submoduleIds = module.submodules.map(sub => sub.id);
      return [...ids, module.id, ...submoduleIds];
    }, []);
  };

  // Check if a module has any selected submodules
  const hasSelectedSubmodules = (moduleId) => {
    const module = MODULES.find(m => m.id === moduleId);
    if (!module) return false;
    return module.submodules.some(sub => formData.allowedModules.includes(sub.id));
  };

  // Check if all submodules of a module are selected
  const allSubmodulesSelected = (moduleId) => {
    const module = MODULES.find(m => m.id === moduleId);
    if (!module || module.submodules.length === 0) return false;
    return module.submodules.every(sub => formData.allowedModules.includes(sub.id));
  };

  const handleModuleToggle = (id, isMainModule = false) => {
    const module = MODULES.find(m => m.id === id);
    
    if (isMainModule && module) {
      // If it's a main module being toggled
      const isCurrentlySelected = formData.allowedModules.includes(id);
      const submoduleIds = module.submodules.map(sub => sub.id);
      
      if (isCurrentlySelected) {
        // Deselecting main module - remove main module and all its submodules
        setFormData(prev => ({
          ...prev,
          allowedModules: prev.allowedModules.filter(moduleId => 
            moduleId !== id && !submoduleIds.includes(moduleId)
          ),
        }));
      } else {
        // Selecting main module - add main module and all its submodules
        setFormData(prev => ({
          ...prev,
          allowedModules: [...new Set([...prev.allowedModules, id, ...submoduleIds])],
        }));
      }
    } else {
      // Handle submodule or standalone module toggle
      const isCurrentlySelected = formData.allowedModules.includes(id);
      
      if (isCurrentlySelected) {
        // Deselecting - just remove this module/submodule
        setFormData(prev => ({
          ...prev,
          allowedModules: prev.allowedModules.filter(moduleId => moduleId !== id),
        }));
      } else {
        // Selecting a submodule - add it and ensure parent module is selected
        const parentModule = MODULES.find(m => m.submodules.some(sub => sub.id === id));
        
        if (parentModule) {
          // It's a submodule - ensure parent is selected
          setFormData(prev => ({
            ...prev,
            allowedModules: [...new Set([...prev.allowedModules, id, parentModule.id])],
          }));
        } else {
          // It's a standalone module
          setFormData(prev => ({
            ...prev,
            allowedModules: [...prev.allowedModules, id],
          }));
        }
      }
    }
  };

  const handleSelectAll = () => {
    const moduleIds = getAllModuleIds();
    const allSelected = moduleIds.every(id => formData.allowedModules.includes(id));

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        allowedModules: prev.allowedModules.filter(id => !moduleIds.includes(id)),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        allowedModules: [...new Set([...prev.allowedModules, ...moduleIds])],
      }));
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    onSubmit({
      ...formData,
      type: 'client',
      roleId: 'client-role',
      status: 'active',
    });
    setFormData({
      name: '',
      email: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      allowedModules: [],
      password: '',
      confirmPassword: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Client</h2>
              <p className="text-sm text-gray-600">Set up a new client with custom module permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-80 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-100px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Client Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Client Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Password Fields */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-gray-600" />
                        Set Password
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                              onBlur={validatePassword}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                              placeholder="Enter password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              onBlur={validatePassword}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                              placeholder="Confirm password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        {passwordError && (
                          <div className="text-sm text-red-600 mt-2">
                            {passwordError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Permissions */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-gray-600" />
                        Module Permissions
                      </h3>
                      <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {formData.allowedModules.length} selected
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 border ${
                            selectedCategory === category.id
                              ? category.color + ' shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {category.name} ({category.count})
                        </button>
                      ))}
                    </div>

                    {/* Select All */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        {getAllModuleIds().every(id => formData.allowedModules.includes(id))
                          ? 'Deselect All'
                          : 'Select All'} in {categories.find(c => c.id === selectedCategory)?.name}
                      </button>
                      <span className="text-xs text-gray-500">
                        {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                  </div>

                  {/* Modules List */}
                  <div className="max-h-96 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {filteredModules.map(module => {
                        const isSelected = formData.allowedModules.includes(module.id);
                        const hasSubSelected = hasSelectedSubmodules(module.id);
                        const allSubSelected = allSubmodulesSelected(module.id);
                        const isExpanded = expandedModules.has(module.id);
                        
                        // Determine checkbox state for main module
                        let checkboxState = 'unchecked';
                        if (isSelected && allSubSelected) {
                          checkboxState = 'checked';
                        } else if (isSelected || hasSubSelected) {
                          checkboxState = 'indeterminate';
                        }
                        
                        return (
                          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Main Module */}
                            <div className={`p-4 transition-all ${
                              isSelected || hasSubSelected ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div
                                  onClick={() => handleModuleToggle(module.id, true)}
                                  className="flex items-center space-x-3 cursor-pointer flex-1"
                                >
                                  <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      checkboxState === 'checked' 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : checkboxState === 'indeterminate'
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {checkboxState === 'checked' && <Check className="w-3 h-3 text-white" />}
                                    {checkboxState === 'indeterminate' && (
                                      <div className="w-2 h-2 bg-white rounded-sm" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                      {module.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                      {module.description}
                                    </p>
                                  </div>
                                </div>
                                
                                {module.submodules.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleModuleExpansion(module.id)}
                                    className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Submodules */}
                            {module.submodules.length > 0 && isExpanded && (
                              <div className="border-t border-gray-200 bg-gray-50">
                                {module.submodules.map(submodule => {
                                  const isSubSelected = formData.allowedModules.includes(submodule.id);
                                  return (
                                    <div
                                      key={submodule.id}
                                      onClick={() => handleModuleToggle(submodule.id)}
                                      className={`p-4 pl-12 cursor-pointer transition-all border-b last:border-b-0 border-gray-200 ${
                                        isSubSelected
                                          ? 'bg-blue-50'
                                          : 'hover:bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                            isSubSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 hover:border-gray-400'
                                          }`}
                                        >
                                          {isSubSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-medium text-gray-800 mb-1">
                                            {submodule.name}
                                          </h5>
                                          {submodule.description && (
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                              {submodule.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{formData.allowedModules.length}</span> modules selected
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !formData.name || 
                    !formData.email || 
                    !formData.companyName || 
                    formData.allowedModules.length === 0 ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    passwordError
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 font-medium shadow-lg"
                >
                  Create Client
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};