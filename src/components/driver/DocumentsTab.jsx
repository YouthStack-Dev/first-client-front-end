// import React from 'react';
// import { Eye } from 'lucide-react';
// import FormField from '../FormField';

// const DocumentsTab = ({ formData, errors, onChange, onFileChange }) => {
//   const verificationStatuses = ['Pending', 'Approved', 'Rejected'];

//   const getDocName = (name) =>
//     formData[`${name}Name`] || formData[`${name}`]?.name || '';

//   const getDocFile = (name) => formData[name];

//   const UploadButton = ({ name, label }) => (
//     <div className="flex items-center space-x-2">
//       <label className="px-3 py-1 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
//         {label}
//         <input
//           type="file"
//           className="hidden"
//           onChange={(e) =>
//             e.target.files?.[0] && onFileChange(name, e.target.files[0])
//           }
//         />
//       </label>
//       {getDocName(name) && (
//         <>
//           <span className="text-sm text-green-600 truncate max-w-[140px]">
//             {getDocName(name)}
//           </span>
//           {getDocFile(name) && (
//             <a
//               href={URL.createObjectURL(getDocFile(name))}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800"
//               title="View file"
//             >
//               <Eye size={18} />
//             </a>
//           )}
//         </>
//       )}
//     </div>
//   );

//   const renderDocumentRow = (label, statusName, dateName, documentName, required) => (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-200">
//       <div className="text-gray-700 font-medium">
//         {label}
//         {required && <span className="text-red-500">*</span>}
//       </div>

//       {statusName ? (
//         <select
//           name={statusName}
//           value={formData[statusName]}
//           onChange={onChange}
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         >
//           {verificationStatuses.map((status) => (
//             <option key={status.toLowerCase()} value={status.toLowerCase()}>
//               {status}
//             </option>
//           ))}
//         </select>
//       ) : (
//         <div />
//       )}

//       <input
//         type="date"
//         name={dateName}
//         value={formData[dateName]}
//         onChange={onChange}
//         className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//       />

//       <UploadButton name={documentName} label="Upload" />
//     </div>
//   );

//   return (
//     <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
//       {renderDocumentRow('BGV Status', 'bgvStatus', 'bgvExpiryDate', 'bgvDocument', true)}
//       {renderDocumentRow('Police Verification', 'policeVerification', 'policeExpiryDate', 'policeDocument', true)}
//       {renderDocumentRow('Medical Verification', 'medicalVerification', 'medicalExpiryDate', 'medicalDocument', true)}
//       {renderDocumentRow('Training Verification', 'trainingVerification', 'trainingExpiryDate', 'trainingDocument', true)}
//       {renderDocumentRow('Eye Test', '', 'eyeTestExpiryDate', 'eyeTestDocument')}

//       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//         <FormField label="License Number" name="licenseNumber" required error={errors.licenseNumber}>
//           <input
//             type="text"
//             name="licenseNumber"
//             value={formData.licenseNumber}
//             onChange={onChange}
//             placeholder="Enter license number"
//             className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </FormField>

//         <FormField label="License Expiry Date" name="licenseExpiryDate" required error={errors.licenseExpiryDate}>
//           <div className="flex items-center space-x-3">
//             <input
//               type="date"
//               name="licenseExpiryDate"
//               value={formData.licenseExpiryDate}
//               onChange={onChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <UploadButton name="licenseDocument" label="Upload" />
//           </div>
//         </FormField>

//         <FormField label="Induction Date" name="inductionDate" error={errors.inductionDate}>
//           <div className="flex items-center space-x-3">
//             <input
//               type="date"
//               name="inductionDate"
//               value={formData.inductionDate}
//               onChange={onChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <UploadButton name="inductionDocument" label="Upload" />
//           </div>
//         </FormField>

//         <FormField label="Badge Number" name="badgeNumber" error={errors.badgeNumber}>
//           <div className="flex flex-col space-y-2">
//             <input
//               type="text"
//               name="badgeNumber"
//               value={formData.badgeNumber}
//               onChange={onChange}
//               placeholder="Enter badge number"
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <input
//               type="date"
//               name="badgeExpiryDate"
//               value={formData.badgeExpiryDate}
//               onChange={onChange}
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </FormField>

//         <FormField label="Alternate Govt. ID" name="alternateGovtId" error={errors.alternateGovtId}>
//           <select
//             name="alternateGovtId"
//             value={formData.alternateGovtId}
//             onChange={onChange}
//             className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">Select ID</option>
//             <option value="aadhar">Aadhar Card</option>
//             <option value="pan">PAN Card</option>
//             <option value="voter">Voter ID</option>
//           </select>
//         </FormField>

//         <FormField label="ID Number" name="govtIdNumber" error={errors.govtIdNumber}>
//           <div className="flex items-center space-x-3">
//             <input
//               type="text"
//               name="govtIdNumber"
//               value={formData.govtIdNumber}
//               onChange={onChange}
//               placeholder="Enter ID number"
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <UploadButton name="govtIdDocument" label="Upload" />
//           </div>
//         </FormField>
//       </div>
//     </div>
//   );
// };

// export default DocumentsTab;



import React from 'react';
import { Eye } from 'lucide-react';
import FormField from '../FormField';

const DocumentsTab = ({ formData, errors, onChange, onFileChange }) => {
  const verificationStatuses = ['Pending', 'Approved', 'Rejected'];

  const getDocName = (name) =>
    formData[`${name}Name`] || formData[name]?.name || formData[name]?.split('/')?.pop() || '';

  const getDocFile = (name) => formData[name];

  const UploadButton = ({ name, label }) => {
    const fileValue = getDocFile(name);
    const isURL = typeof fileValue === 'string' && fileValue.startsWith('http');

    const previewURL = isURL
      ? fileValue
      : fileValue instanceof File
      ? URL.createObjectURL(fileValue)
      : null;

    return (
      <div className="flex items-center space-x-2">
        <label className="px-3 py-1 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
          {label}
          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && onFileChange(name, e.target.files[0])
            }
          />
        </label>
        {getDocName(name) && (
          <>
            <span className="text-sm text-green-600 truncate max-w-[140px]">
              {getDocName(name)}
            </span>
            {previewURL && (
              <a
                href={previewURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                title="Preview"
              >
                <Eye size={18} />
              </a>
            )}
          </>
        )}
      </div>
    );
  };

  const renderDocumentRow = (label, statusName, dateName, documentName, required) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-200">
      <div className="text-gray-700 font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>

      {statusName ? (
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
      ) : (
        <div />
      )}

      <input
        type="date"
        name={dateName}
        value={formData[dateName]}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <UploadButton name={documentName} label="Upload" />
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      {renderDocumentRow('BGV Status', 'bgvStatus', 'bgvExpiryDate', 'bgvDocument', true)}
      {renderDocumentRow('Police Verification', 'policeVerification', 'policeExpiryDate', 'policeDocument', true)}
      {renderDocumentRow('Medical Verification', 'medicalVerification', 'medicalExpiryDate', 'medicalDocument', true)}
      {renderDocumentRow('Training Verification', 'trainingVerification', 'trainingExpiryDate', 'trainingDocument', true)}
      {renderDocumentRow('Eye Test', '', 'eyeTestExpiryDate', 'eyeTestDocument')}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
          <div className="flex items-center space-x-3">
            <input
              type="date"
              name="licenseExpiryDate"
              value={formData.licenseExpiryDate}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <UploadButton name="licenseDocument" label="Upload" />
          </div>
        </FormField>

        <FormField label="Induction Date" name="inductionDate" error={errors.inductionDate}>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              name="inductionDate"
              value={formData.inductionDate}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <UploadButton name="inductionDocument" label="Upload" />
          </div>
        </FormField>

        <FormField label="Badge Number" name="badgeNumber" error={errors.badgeNumber}>
          <div className="flex flex-col space-y-2">
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
          <div className="flex items-center space-x-3">
            <input
              type="text"
              name="govtIdNumber"
              value={formData.govtIdNumber}
              onChange={onChange}
              placeholder="Enter ID number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <UploadButton name="govtIdDocument" label="Upload" />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default DocumentsTab;
