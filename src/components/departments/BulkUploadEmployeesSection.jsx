import React, { useState, useEffect } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { bulkUploadEmployees } from "../../redux/features/employee/employeethunk";
import { resetBulkUploadState } from "../../redux/features/employee/employeeSlice";
import BulkUploadErrorModal from "./BulkUploadErrorModal";
import { API_CLIENT } from "../../Api/API_Client";

const BulkUploadEmployeesSection = ({ teamId, onSuccess }) => {
  const dispatch = useDispatch();

  const { loading, result, error } = useSelector(
    (state) => state.employee.bulkUpload
  );

  const [file, setFile] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  /* ===============================
     FILE SELECTION
  ================================ */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Only Excel files (.xlsx, .xls) allowed");
      return;
    }

    // Clear old errors when new file is selected
    dispatch(resetBulkUploadState());
    setFile(selectedFile);
  };

  /* ===============================
     DOWNLOAD TEMPLATE
  ================================ */
  const handleDownloadTemplate = async () => {
    try {
      const response = await API_CLIENT.get(
        "/employees/bulk-upload/template",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Employee_Bulk_Upload_Template.xlsx";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download failed:", err);
      toast.error("Failed to download template");
    }
  };

  /* ===============================
     UPLOAD FILE
  ================================ */
  const handleUpload = () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    dispatch(bulkUploadEmployees(file));
  };

  /* ===============================
     HANDLE RESULT
  ================================ */
  useEffect(() => {
    if (!result) return;

    // Only when everything is successful
    if (result.success === true) {
      toast.success("Employees uploaded successfully");
      setFile(null);
      dispatch(resetBulkUploadState());
      onSuccess?.();
    }
  }, [result, dispatch, onSuccess]);

  /* ===============================
     ERROR DATA
  ================================ */
  const failedEmployees =
    result?.details?.failed_employees || [];

  const hasRowErrors = failedEmployees.length > 0;

  return (
    <div className="bg-white border border-dashed rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} />
          <h3 className="font-semibold">Bulk Upload Employees</h3>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-sm text-blue-600"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-gray-50">
        <Upload size={30} className="mb-2" />
        <p className="text-sm">
          {file ? file.name : "Click to upload Excel file"}
        </p>
        <span className="text-xs text-gray-500 mt-1">
          .xlsx / .xls | Max 500 rows
        </span>

        <input
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
        />
      </label>

      {/* API-level Error */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
          <p className="text-sm font-medium text-red-700">
            Upload failed
          </p>
          <p className="text-xs text-red-600 mt-1">
            {error.detail || "Something went wrong"}
          </p>
        </div>
      )}

      {/* Validation Summary */}
      {hasRowErrors && (
        <div className="mt-4 bg-yellow-50 border border-yellow-300 p-3 rounded flex items-center justify-between">
          <p className="text-sm text-yellow-800 font-medium">
            {result.details.valid_rows} of {result.details.total_rows} employees created.
            Fix the errors and re-upload.
          </p>

          <button
            onClick={() => setShowErrorModal(true)}
            className="text-sm text-blue-600 underline"
          >
            View Errors
          </button>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Employees"}
        </button>
      </div>

      {/* Error Modal */}
      <BulkUploadErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errors={failedEmployees}
      />
    </div>
  );
};

export default BulkUploadEmployeesSection;
