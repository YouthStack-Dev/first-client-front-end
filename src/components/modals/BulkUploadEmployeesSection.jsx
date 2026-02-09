import React, { useState, useEffect } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { bulkUploadEmployees } from "../../redux/features/employee/employeethunk";
import { resetBulkUploadState } from "../../redux/features/employee/employeeSlice";
import BulkUploadErrorModal from "./BulkUploadErrorModal";
import { API_CLIENT } from "../../Api/API_Client";

import Modal from "../modals/Modal";

const BulkUploadEmployeesSection = ({ isOpen, onClose, teamId, onSuccess }) => {
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
    result?.details?.failed_employees ||
    error?.detail?.details?.failed_employees ||
    error?.details?.failed_employees ||
    [];

  const hasRowErrors = failedEmployees.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Employees"
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Template Download Link */}
        <div className="flex justify-end">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} />
            Download Template
          </button>
        </div>

        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 cursor-pointer hover:bg-gray-50 transition-colors">
          <Upload size={40} className="mb-3 text-gray-400" />
          <p className="font-medium text-gray-700">
            {file ? file.name : "Click to upload Excel file"}
          </p>
          <span className="text-xs text-gray-500 mt-2">
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
        {error && !hasRowErrors && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm font-medium text-red-700">Upload failed</p>
            <p className="text-xs text-red-600 mt-1">
              {error?.message ||
                (typeof error?.detail === "string"
                  ? error.detail
                  : error?.detail?.message) ||
                "Something went wrong"}
            </p>
          </div>
        )}

        {/* Validation Summary */}
        {hasRowErrors && (
          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded flex items-center justify-between">
            <p className="text-sm text-yellow-800 font-medium">
              {result
                ? `${result.details.valid_rows} of ${result.details.total_rows} employees created.`
                : "Upload failed with validation errors."}{" "}
              Fix the errors and re-upload.
            </p>

            <button
              onClick={() => setShowErrorModal(true)}
              className="text-sm text-blue-600 underline font-medium"
            >
              View Errors
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading ? "Uploading..." : "Upload Employees"}
          </button>
        </div>

        {/* Error Modal (Nested) */}
        <BulkUploadErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          errors={failedEmployees}
        />
      </div>
    </Modal>
  );
};

export default BulkUploadEmployeesSection;
