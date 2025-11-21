import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  Edit2,
  Save,
  User,
  Mail,
  Phone,
  Key,
  Building,
  Search,
  Check,
} from "lucide-react";

const VendorModalForm = ({
  isOpen = false,
  onClose,
  onSubmit,
  mode = "create", // 'create' | 'edit' | 'view'
  vendorData = null,
  loading = false,
  userType = "user", // 'superadmin' | 'admin' | 'user'
  tenants = [], // Array of tenant objects: { id, name, tenantId }
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vendor_code: "",
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    admin_password: "",
    tenant_id: "", // Added tenant_id field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [tenantSearch, setTenantSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantList, setShowTenantList] = useState(false);

  // Check if user is superadmin
  const isSuperAdmin = userType === "superadmin";

  // Form field configuration
  const formFields = [
    {
      label: "Vendor Name",
      name: "name",
      type: "text",
      icon: Building,
      required: true,
      placeholder: "Enter vendor company name",
    },
    {
      label: "Vendor Email",
      name: "email",
      type: "email",
      icon: Mail,
      required: true,
      placeholder: "Enter vendor company email",
    },
    {
      label: "Vendor Phone",
      name: "phone",
      type: "text",
      icon: Phone,
      required: false,
      placeholder: "Enter vendor company phone",
    },
    {
      label: "Vendor Code",
      name: "vendor_code",
      type: "text",
      icon: Building,
      required: true,
      placeholder: "Enter unique vendor code",
    },
    {
      label: "Admin Name",
      name: "admin_name",
      type: "text",
      icon: User,
      required: true,
      placeholder: "Enter admin full name",
    },
    {
      label: "Admin Email",
      name: "admin_email",
      type: "email",
      icon: Mail,
      required: true,
      placeholder: "Enter admin email address",
    },
    {
      label: "Admin Phone",
      name: "admin_phone",
      type: "text",
      icon: Phone,
      required: false,
      placeholder: "Enter admin phone number",
    },
    {
      label: "Admin Password",
      name: "admin_password",
      type: "password",
      icon: Key,
      required: mode === "create",
      placeholder: "Enter admin password",
      hidden: mode === "view",
    },
  ];

  // Filter tenants based on search
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name?.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      tenant.tenantId?.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  // Initialize form data when modal opens or vendorData changes
  useEffect(() => {
    if (vendorData) {
      setFormData({
        name: vendorData.name || "",
        email: vendorData.email || "",
        phone: vendorData.phone || "",
        vendor_code: vendorData.vendor_code || "",
        admin_name: vendorData.admin_name || "",
        admin_email: vendorData.admin_email || "",
        admin_phone: vendorData.admin_phone || "",
        admin_password: "", // Never pre-fill password for security
        tenant_id: vendorData.tenant_id || "",
      });

      // Set selected tenant if tenant_id exists
      if (vendorData.tenant_id && tenants.length > 0) {
        const tenant = tenants.find((t) => t.id === vendorData.tenant_id);
        setSelectedTenant(tenant || null);
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        vendor_code: "",
        admin_name: "",
        admin_email: "",
        admin_phone: "",
        admin_password: "",
        tenant_id: "",
      });
      setSelectedTenant(null);
    }

    setIsEditing(false);
    setErrors({});
    setShowPassword(false);
    setTenantSearch("");
    setShowTenantList(false);
  }, [vendorData, isOpen, mode, tenants]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle tenant selection
  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    setFormData((prev) => ({
      ...prev,
      tenant_id: tenant.id,
    }));
    setShowTenantList(false);
    setTenantSearch("");
  };

  // Handle tenant search change
  const handleTenantSearchChange = (e) => {
    setTenantSearch(e.target.value);
    setShowTenantList(true);
  };

  // Clear tenant selection
  const handleClearTenant = () => {
    setSelectedTenant(null);
    setFormData((prev) => ({
      ...prev,
      tenant_id: "",
    }));
    setTenantSearch("");
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    formFields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Email validation
      if (
        (field.name === "email" || field.name === "admin_email") &&
        formData[field.name]
      ) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }

      // Phone validation (basic)
      if (
        (field.name === "phone" || field.name === "admin_phone") &&
        formData[field.name]
      ) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid phone number";
        }
      }

      // Password validation for create mode
      if (
        field.name === "admin_password" &&
        mode === "create" &&
        field.required
      ) {
        if (!formData.admin_password) {
          newErrors.admin_password = "Admin password is required";
        } else if (formData.admin_password.length < 6) {
          newErrors.admin_password =
            "Password must be at least 6 characters long";
        }
      }
    });

    // Tenant validation for superadmin
    if (isSuperAdmin && !formData.tenant_id) {
      newErrors.tenant_id = "Please select a tenant";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submissionData = { ...formData };

    // Don't send password if it's empty in edit mode
    if (mode === "edit" && !submissionData.admin_password) {
      delete submissionData.admin_password;
    }

    onSubmit(submissionData);
  };

  // Toggle edit mode for view mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Determine if form is in editable state
  const isEditable =
    mode === "create" || (mode === "view" && isEditing) || mode === "edit";

  // Get modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Vendor";
      case "edit":
        return "Edit Vendor";
      case "view":
        return isEditing ? "Edit Vendor" : "Vendor Details";
      default:
        return "Vendor Management";
    }
  };

  // Close modal handler
  const handleClose = () => {
    setErrors({});
    setIsEditing(false);
    setTenantSearch("");
    setShowTenantList(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {getModalTitle()}
            </h2>
            {isSuperAdmin && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Super Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Edit Toggle Button for View Mode */}
            {mode === "view" && !isEditing && (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}

            {/* Cancel Edit Button for View Mode */}
            {mode === "view" && isEditing && (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            )}

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Tenant Selection Section for Super Admin */}
            {isSuperAdmin && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Assign to Tenant
                </h3>

                {/* Selected Tenant Display */}
                {selectedTenant && !showTenantList && (
                  <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {selectedTenant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tenant ID: {selectedTenant.tenantId}
                        </p>
                      </div>
                      {isEditable && (
                        <button
                          type="button"
                          onClick={handleClearTenant}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tenant Search */}
                {(!selectedTenant || showTenantList) && isEditable && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tenants by name or ID..."
                        value={tenantSearch}
                        onChange={handleTenantSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Tenant List */}
                    {showTenantList && (
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                        {filteredTenants.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No tenants found
                          </div>
                        ) : (
                          filteredTenants.map((tenant) => (
                            <div
                              key={tenant.id}
                              onClick={() => handleTenantSelect(tenant)}
                              className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                selectedTenant?.id === tenant.id
                                  ? "bg-blue-50 border-blue-200"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {tenant.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    ID: {tenant.tenantId}
                                  </p>
                                </div>
                                {selectedTenant?.id === tenant.id && (
                                  <Check size={16} className="text-green-500" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {errors.tenant_id && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.tenant_id}
                  </p>
                )}
              </div>
            )}

            {/* Vendor Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => {
                if (field.hidden) return null;

                const IconComponent = field.icon;
                const isPasswordField = field.type === "password";
                const isViewMode = mode === "view" && !isEditing;

                return (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconComponent size={18} className="text-gray-400" />
                      </div>

                      {isViewMode ? (
                        // Display mode for view
                        <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                          {field.name === "admin_password"
                            ? "••••••••"
                            : formData[field.name] || "N/A"}
                        </div>
                      ) : (
                        // Input mode for create/edit
                        <div className="relative">
                          <input
                            type={
                              isPasswordField && !showPassword
                                ? "password"
                                : field.type
                            }
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            disabled={!isEditable || loading}
                            className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors[field.name]
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 bg-white"
                            } ${
                              !isEditable
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />

                          {/* Show/Hide Password Toggle */}
                          {isPasswordField && isEditable && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff size={18} className="text-gray-400" />
                              ) : (
                                <Eye size={18} className="text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Actions */}
            {(mode === "create" ||
              mode === "edit" ||
              (mode === "view" && isEditing)) && (
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {mode === "create" ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {mode === "create" ? "Create Vendor" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorModalForm;
