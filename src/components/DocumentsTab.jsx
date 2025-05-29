import React from 'react';
import FormField from './FormField';

const DocumentsTab = ({ formData, errors, onChange, onFileChange }) => {
  const verificationStatuses = ['Pending', 'Approved', 'Rejected'];

  const renderDocumentRow = (
    label,
    statusName,
    dateName,
    documentName,
    required
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-200">
      <div className="text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>

      {statusName && (
        <select
          name={statusName}
          value={formData[statusName]}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {verificationStatuses.map((status) => (
            <option key={status.toLowerCase()} value={status.toLowerCase()}>
              {status}
            </option>
          ))}
        </select>
      )}

      <input
        type="date"
        name={dateName}
        value={formData[dateName]}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Document</span>
        <label className="cursor-pointer text-blue-600 hover:text-blue-700">
          Upload file
          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && onFileChange(documentName, e.target.files[0])
            }
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      

      {renderDocumentRow('BGV Status', 'bgvStatus', 'bgvExpiryDate', 'bgvDocument', true)}
      {renderDocumentRow('Police Verification', 'policeVerification', 'policeExpiryDate', 'policeDocument', true)}
      {renderDocumentRow('Medical Verification', 'medicalVerification', 'medicalExpiryDate', 'medicalDocument', true)}
      {renderDocumentRow('Training Verification', 'trainingVerification', 'trainingExpiryDate', 'trainingDocument', true)}
      {renderDocumentRow('Eye Test', '', 'eyeTestExpiryDate', 'eyeTestDocument')}

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <FormField label="License Number" name="licenseNumber" required error={errors.licenseNumber}>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={onChange}
              placeholder="Enter license number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>

          <FormField label="License Expiry Date" name="licenseExpiryDate" required error={errors.licenseExpiryDate}>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                name="licenseExpiryDate"
                value={formData.licenseExpiryDate}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                Upload file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFileChange('licenseDocument', e.target.files[0])}
                />
              </label>
            </div>
          </FormField>

          <FormField label="Induction Date" name="inductionDate" error={errors.inductionDate}>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                name="inductionDate"
                value={formData.inductionDate}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                Upload file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFileChange('inductionDocument', e.target.files[0])}
                />
              </label>
            </div>
          </FormField>

          <FormField label="Badge Number" name="badgeNumber" error={errors.badgeNumber}>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={onChange}
                placeholder="Enter badge number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                name="badgeExpiryDate"
                value={formData.badgeExpiryDate}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Alternate Govt. ID" name="alternateGovtId" error={errors.alternateGovtId}>
              <select
                name="alternateGovtId"
                value={formData.alternateGovtId}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select ID</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter">Voter ID</option>
              </select>
            </FormField>

            <FormField label="ID Number" name="govtIdNumber" error={errors.govtIdNumber}>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  name="govtIdNumber"
                  value={formData.govtIdNumber}
                  onChange={onChange}
                  placeholder="Enter ID number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                  Upload file
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && onFileChange('govtIdDocument', e.target.files[0])
                    }
                  />
                </label>
              </div>
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
