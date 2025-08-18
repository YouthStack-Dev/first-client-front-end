import React, { useState, useCallback } from 'react';
import { Eye, Upload, FileText, Calendar, Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { logDebug } from '../../utils/logger';

const DocumentsTab = ({ formData = {}, errors = {}, onChange, onFileChange, mode = 'create' }) => {
  const [expandedSections, setExpandedSections] = useState({
    verification: true,
    licensing: true,
    identification: true
  });

  const verificationStatuses = ['pending', 'approved', 'rejected'];
  const isReadOnly = mode === 'view';

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDocName = (name) =>
    formData[`${name}Name`] || formData[name]?.name || formData[name]?.split('/')?.pop() || '';

  const getDocFile = (name) => formData[name];

  const getDocumentUrl = (name) => {
    const fileValue = getDocFile(name);
    if (typeof fileValue === 'string' && fileValue) {
      return fileValue.startsWith('http') ? fileValue : `https://api.gocab.tech/${fileValue}`;
    } else if (fileValue instanceof File) {
      return URL.createObjectURL(fileValue);
    }
    return null;
  };

  const ViewDocumentButton = ({ name }) => {
    const documentUrl = getDocumentUrl(name);
    const documentName = getDocName(name);

    if (!documentUrl || !documentName) return null;

    return (
      <a
        href={documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        title="View document"
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </a>
    );
  };

  const FileUploadField = ({ name, label, required = false }) => {
    const documentName = getDocName(name);
    const hasDocument = !!documentName;
    const error = errors[name];

    const handleFileUpload = useCallback((e) => {
      const file = e.target.files?.[0];
      if (file && onFileChange) {
        onFileChange(name, file);
      }
    }, [name, onFileChange]);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-1 text-gray-500" />
            {label}
            {required && !isReadOnly && <span className="text-red-500 ml-1">*</span>}
          </label>
          {hasDocument && <ViewDocumentButton name={name} />}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isReadOnly && (
            <label className="flex-1 cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-3 text-center hover:border-blue-400 transition-colors ${
                hasDocument ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
              } ${error ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {hasDocument ? 'Replace file' : 'Choose file'}
                  </span>
                </div>
                {hasDocument && (
                  <div className="mt-1 text-xs text-green-600 truncate">
                    {documentName}
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                key={`${name}-${hasDocument}`} // Add key to reset input when file changes
              />
            </label>
          )}
          
          {isReadOnly && !hasDocument && (
            <div className="flex-1 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
              <span className="text-sm text-gray-500">No document uploaded</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-xs flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  };

  const StatusField = ({ name, label }) => {
    const handleStatusChange = useCallback((e) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Shield className="w-4 h-4 mr-1 text-gray-500" />
          {label} Status
        </label>
        <div className="flex items-center space-x-2">
          {!isReadOnly ? (
            <select
              name={name}
              value={formData[name] || 'pending'}
              onChange={handleStatusChange}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {verificationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <div className={`flex-1 px-3 py-2 rounded-md border ${getStatusColor(formData[name])}`}>
              <div className="flex items-center">
                {getStatusIcon(formData[name])}
                <span className="ml-2 text-sm font-medium">
                  {formData[name] ? formData[name].charAt(0).toUpperCase() + formData[name].slice(1) : 'Pending'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DateField = ({ name, label, required = false }) => {
    const handleDateChange = useCallback((e) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
          {label}
          {required && !isReadOnly && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="date"
          name={name}
          value={formData[name] || ''}
          onChange={handleDateChange}
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          readOnly={isReadOnly}
        />
        {errors[name] && (
          <div className="text-red-500 text-xs flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  const TextField = ({ name, label, placeholder, required = false }) => {


  const handleTextChange = (e) => {
    console.log(`TextField ${e.target.name} changed:`, e.target.value);
    if (onChange) {
      onChange(e);
    }
  }
    logDebug(`TextField ${name} changed: in form data `, formData[name]);
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && !isReadOnly && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          name={name}
          value={formData[name] || ''}
          onChange={handleTextChange}
          placeholder={!isReadOnly ? placeholder : ''}
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          readOnly={isReadOnly}
        />
        {errors[name] && (
          <div className="text-red-500 text-xs flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  const SelectField = ({ name, label, options, placeholder = "Select option" }) => {
    const handleSelectChange = useCallback((e) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <select
          name={name}
          value={formData[name] || ''}
          onChange={handleSelectChange}
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          disabled={isReadOnly}
        >
          <option value="">{isReadOnly ? "" : placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors[name] && (
          <div className="text-red-500 text-xs flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, isExpanded, onToggle, icon: Icon, count }) => (
    <div 
      className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {count && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {count} items
          </span>
        )}
      </div>
      <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  const verificationDocuments = [
    {
      label: 'Background Verification',
      statusName: 'bgvStatus',
      dateName: 'bgvExpiryDate',
      documentName: 'bgvDocument',
      required: true
    },
    {
      label: 'Police Verification',
      statusName: 'policeVerification',
      dateName: 'policeExpiryDate',
      documentName: 'policeDocument',
      required: true
    },
    {
      label: 'Medical Verification',
      statusName: 'medicalVerification',
      dateName: 'medicalExpiryDate',
      documentName: 'medicalDocument',
      required: true
    },
    {
      label: 'Training Verification',
      statusName: 'trainingVerification',
      dateName: 'trainingExpiryDate',
      documentName: 'trainingDocument',
      required: true
    },
    {
      label: 'Eye Test',
      statusName: 'eyeTestStatus',
      dateName: 'eyeTestExpiryDate',
      documentName: 'eyeTestDocument',
      required: true
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Verification Documents Section */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Verification Documents"
          isExpanded={expandedSections.verification}
          onToggle={() => toggleSection('verification')}
          icon={Shield}
          count={verificationDocuments.length}
        />
        {expandedSections.verification && (
          <div className="p-6 space-y-6">
            {verificationDocuments.map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-600" />
                  {doc.label}
                  {doc.required && !isReadOnly && <span className="text-red-500 ml-1">*</span>}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <StatusField name={doc.statusName} label={doc.label} />
                  <DateField name={doc.dateName} label="Expiry Date" required={doc.required} />
                  <FileUploadField name={doc.documentName} label="Document" required={doc.required} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licensing Information Section */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Licensing Information"
          isExpanded={expandedSections.licensing}
          onToggle={() => toggleSection('licensing')}
          icon={FileText}
          count={4}
        />
        {expandedSections.licensing && (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Driver License
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TextField 
                  name="licenseNumber" 
                  label="License Number" 
                  placeholder="Enter license number" 
                  required={!isReadOnly}
                />
                <DateField name="licenseExpiryDate" label="Expiry Date" required={!isReadOnly} />
                <FileUploadField name="licenseDocument" label="License Document" required={!isReadOnly} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Induction Details
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DateField name="inductionDate" label="Induction Date" />
                <FileUploadField name="inductionDocument" label="Induction Document" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Badge Information
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TextField 
                  name="badgeNumber" 
                  label="Badge Number" 
                  placeholder="Enter badge number"
                />
                <DateField name="badgeExpiryDate" label="Badge Expiry Date" />
                <FileUploadField name="badgeDocument" label="Badge Document" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Identification Documents Section */}
      <div>
        <SectionHeader
          title="Identification Documents"
          isExpanded={expandedSections.identification}
          onToggle={() => toggleSection('identification')}
          icon={FileText}
          count={1}
        />
        
        {expandedSections.identification && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Government ID
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SelectField 
                  name="alternateGovtId" 
                  label="ID Type" 
                  placeholder="Select ID type"
                  options={[
                    { value: 'aadhar', label: 'Aadhar Card' },
                    { value: 'pan', label: 'PAN Card' },
                    { value: 'voter', label: 'Voter ID' }
                  ]}
                />
                <TextField 
                  name="govtIdNumber" 
                  label="ID Number" 
                  placeholder="Enter ID number"
                />
                <FileUploadField name="govtIdDocument" label="ID Document" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;