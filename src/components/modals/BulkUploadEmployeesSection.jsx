import React, { useState, useEffect, useRef } from "react";
import { Upload, Download, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { bulkUploadEmployees } from "../../redux/features/bulkEmployee/employeeBulkthunk";
import { resetBulkUploadState } from "../../redux/features/bulkEmployee/employeeBulkSlice";
import BulkUploadErrorModal from "./BulkUploadErrorModal";
import { API_CLIENT } from "../../Api/API_Client";

import Modal from "../modals/Modal";

const BulkUploadEmployeesSection = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  /* ===============================
     REDUX STATE
  ================================ */
  const { loading, result, error } = useSelector(
    (state) => state.employeeBulk.bulkUpload
  );

  const [file, setFile] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  /* ===============================
     FILE SELECTION
  ================================ */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Only Excel files (.xlsx, .xls) allowed");
      e.target.value = ""; // Reset input
      return;
    }

    // Optional: Validate file size (e.g., 5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5MB");
      e.target.value = ""; // Reset input
      return;
    }

    // Reset previous errors and set new file
    dispatch(resetBulkUploadState());
    setFile(selectedFile);
  };

  /* ===============================
     REMOVE SELECTED FILE
  ================================ */
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    dispatch(resetBulkUploadState());
  };

  /* ===============================
     DOWNLOAD TEMPLATE
  ================================ */
  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await API_CLIENT.get(
        "/employees/bulk-upload/template",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Employee_Bulk_Upload_Template.xlsx";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (err) {
      toast.error("Failed to download template");
      console.error("Template download error:", err);
    } finally {
      setDownloadingTemplate(false);
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
     SUCCESS HANDLING (FIXED)
  ================================ */
  useEffect(() => {
    if (result?.success === true) {
      toast.success("Employees uploaded successfully");
      handleRemoveFile(); // Clear file and reset input
      dispatch(resetBulkUploadState());
      onSuccess?.();
      onClose(); // Close modal on success
    }
  }, [result, dispatch, onSuccess, onClose]);

  /* ===============================
     CLEANUP ON MODAL CLOSE
  ================================ */
  const handleClose = () => {
    handleRemoveFile();
    setShowErrorModal(false);
    onClose();
  };

  /* ===============================
     ERROR EXTRACTION
  ================================ */
  const failedEmployees = error?.detail?.details?.failed_employees || [];
  const hasRowErrors = failedEmployees.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Upload Employees"
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Download Template */}
        <div className="flex justify-end">
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {downloadingTemplate ? "Downloading..." : "Download Template"}
          </button>
        </div>

        {/* Upload Box */}
        <div className="relative">
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 cursor-pointer hover:bg-gray-50 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload size={40} className="mb-3 text-gray-400" />
            <p className="font-medium text-gray-700">
              {file ? file.name : "Click to upload Excel file"}
            </p>
            <span className="text-xs text-gray-500 mt-2">
              .xlsx / .xls | Max 5MB
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              disabled={loading}
              onChange={handleFileChange}
            />
          </label>

          {/* Remove File Button */}
          {file && !loading && (
            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
              title="Remove file"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 🔴 API ERROR (NO ROW ERRORS) */}
        {error && !hasRowErrors && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm font-medium text-red-700">Upload failed</p>
            <p className="text-xs text-red-600 mt-1">
              {error?.message || "Something went wrong"}
            </p>
          </div>
        )}

        {/* 🟡 VALIDATION ERROR SUMMARY */}
        {hasRowErrors && (
          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded flex items-center justify-between">
            <p className="text-sm text-yellow-800 font-medium">
              {error?.message ||
                `${failedEmployees.length} row(s) have validation errors. Please review them.`}
            </p>

            <button
              onClick={() => setShowErrorModal(true)}
              className="text-sm text-blue-600 underline font-medium hover:text-blue-800"
            >
              View Errors
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload Employees"}
          </button>
        </div>

        {/* 🔍 ERROR DETAILS MODAL */}
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
