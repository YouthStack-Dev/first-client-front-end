import React from 'react';
import { Eye, Upload, FileText, X, CheckCircle } from 'lucide-react';



const UploadButton = ({ name, label, formData, onFileChange }) => {
  const getDocName = (name) =>
    formData[`${name}Name`] || formData[name]?.name || formData[name]?.split('/')?.pop() || '';

  const getDocFile = (name) => formData[name];

  const fileValue = getDocFile(name);
  const isURL = typeof fileValue === 'string' && fileValue.startsWith('http');
  const previewURL = isURL
    ? fileValue
    : fileValue instanceof File
    ? URL.createObjectURL(fileValue)
    : null;

  const fileName = getDocName(name);
  const displayName = fileName.length > 20 
    ? `${fileName.substring(0, 17)}...${fileName.slice(-3)}` 
    : fileName;

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(name, null);
  };

  const hasFile = Boolean(fileName);

  return (
    <div className="flex items-center gap-3">
      <label className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 font-medium text-sm
        ${hasFile 
          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
        }
      `}>
        {hasFile ? <CheckCircle size={18} /> : <Upload size={18} />}
        {hasFile ? 'Uploaded' : label}
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.[0] && onFileChange(name, e.target.files[0])}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </label>
      
      {hasFile && (
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-gray-500 flex-shrink-0" />
            <span 
              className="text-sm text-gray-700 truncate max-w-[120px] lg:max-w-[180px]"
              title={fileName}
            >
              {displayName}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {previewURL && (
              <a
                href={previewURL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Preview document"
              >
                <Eye size={16} />
              </a>
            )}
            <button
              onClick={handleRemove}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadButton;