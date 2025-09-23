import React from 'react';
import { Eye, Upload, FileText, X } from 'lucide-react';
import FormField from '../ui/FormFields';


const DocumentsTab = ({ formData = {}, errors = {}, onChange, onFileChange }) => {
  const verificationStatuses = ['Pending', 'Approved', 'Rejected'];
  const govtIdOptions = ['Aadhar Card', 'PAN Card', 'Voter ID', 'Passport'];

  const getDocName = (name) =>
    formData[`${name}Name`] || 
    (formData[name] instanceof File ? formData[name].name : 
    typeof formData[name] === 'string' ? formData[name].split('/').pop() : '');

  const getDocFile = (name) => formData[name];

  const UploadButton = ({ name, label }) => {
    const fileValue = getDocFile(name);
    const isURL = typeof fileValue === 'string' && fileValue.startsWith('http');
    const previewURL = isURL
      ? fileValue
      : fileValue instanceof File
      ? URL.createObjectURL(fileValue)
      : null;

    const fileName = getDocName(name);
    const displayName = fileName.length > 10 
      ? `${fileName.substring(0, 4)}...${fileName.slice(-3)}` 
      : fileName;

    const handleRemove = (e) => {
      e.stopPropagation();
      onFileChange(name, null);
    };

    return (
      <div className="flex items-center gap-2 w-full">
        <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium">
          <Upload size={16} />
          {label}
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFileChange(name, e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
        {fileName && (
          <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1 max-w-[180px]">
            <FileText size={16} className="text-gray-500 flex-shrink-0" />
            <span 
              className="text-sm text-gray-700 truncate max-w-[80px]"
              title={fileName}
            >
              {displayName}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleRemove}
                className=" text-red-500 p-1 rounded hover:bg-gray-100"
                title="Remove file"
              >
                <X size={16} />
              </button>
              {previewURL && (
                <a
                  href={previewURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                  title="Preview document"
                >
                  <Eye size={16} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentRow = (label, statusName, dateName, documentName, required) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 last:border-0">
      <div className="md:col-span-3">
        <FormField label={label} name={documentName} required={required} />
      </div>

      {statusName && (
        <div className="md:col-span-3">
          <select
            name={statusName}
            value={formData[statusName] || ''}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select status</option>
            {verificationStatuses.map((status) => (
              <option key={status.toLowerCase()} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={`${statusName ? 'md:col-span-3' : 'md:col-span-6'}`}>
        <input
          type="date"
          name={dateName}
          value={formData[dateName] || ''}
          onChange={(e) => onChange(e.target.name, e.target.value)}
          className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      <div className={`${statusName ? 'md:col-span-3' : 'md:col-span-6'}`}>
        <UploadButton name={documentName} label="Upload" />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-100 max-w-8xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Verification Documents</h3>
        <p className="text-sm text-gray-500">Upload all required verification documents</p>
      </div>

      <div className="space-y-4 mb-8">
        {renderDocumentRow('BGV Status', 'bgvStatus', 'bgvExpiryDate', 'bgvDocument', true)}
        {renderDocumentRow('Police Verification', 'policeVerification', 'policeExpiryDate', 'policeDocument', true)}
        {renderDocumentRow('Medical Verification', 'medicalVerification', 'medicalExpiryDate', 'medicalDocument', true)}
        {renderDocumentRow('Training Verification', 'trainingVerification', 'trainingExpiryDate', 'trainingDocument', true)}
        {renderDocumentRow('Eye Test', 'eyeTestStatus', 'eyeTestExpiryDate', 'eyeTestDocument', true)}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">License & Identification</h3>
        <p className="text-sm text-gray-500">Driver's license and government identification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="License Number" 
          name="licenseNumber" 
          required 
          error={errors.licenseNumber}
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                placeholder="DL-1234567890"
                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                type="date"
                name="licenseExpiryDate"
                value={formData.licenseExpiryDate || ''}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <UploadButton name="licenseDocument" label="File" />
            </div>
          </div>
        </FormField>

        <FormField label="Badge Details" name="badgeNumber" error={errors.badgeNumber}>
          <div className="space-y-2">
            <input
              type="text"
              name="badgeNumber"
              value={formData.badgeNumber || ''}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Badge number"
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="badgeExpiryDate"
                value={formData.badgeExpiryDate || ''}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <UploadButton name="badgeDocument" label="File" />
            </div>
          </div>
        </FormField>

        <FormField label="Induction Details" name="inductionDate" error={errors.inductionDate}>
          <div className="flex gap-2">
            <input
              type="date"
              name="inductionDate"
              value={formData.inductionDate || ''}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <UploadButton name="inductionDocument" label="File" />
          </div>
        </FormField>

        <FormField label="Government ID Type" name="alternateGovtId" error={errors.alternateGovtId}>
          <select
            name="alternateGovtId"
            value={formData.alternateGovtId || ''}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select ID type</option>
            {govtIdOptions.map((option) => (
              <option key={option.toLowerCase().replace(' ', '-')} value={option.toLowerCase().replace(' ', '-')}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Government ID Number" name="govtIdNumber" error={errors.govtIdNumber}>
          <div className="flex gap-2">
            <input
              type="text"
              name="govtIdNumber"
              value={formData.govtIdNumber || ''}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="ID number"
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <UploadButton name="govtIdDocument" label="File" />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default DocumentsTab;