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

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Only Excel files (.xlsx, .xls) allowed");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    if (selectedFile.size === 0) {
      toast.error("The selected file is empty");
      e.target.value = "";
      return;
    }

    if (selectedFile.name.length > 255) {
      toast.error("File name is too long");
      e.target.value = "";
      return;
    }

    dispatch(resetBulkUploadState());
    setFile(selectedFile);
  };

  /* ===============================
     REMOVE FILE
  ================================ */
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      if (!response.data) throw new Error("Empty response from server");

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
      console.error("Template download error:", err);
      if (err.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.");
      } else if (err.response?.status === 404) {
        toast.error("Template not found on server");
      } else {
        toast.error("Failed to download template. Please try again.");
      }
    } finally {
      setDownloadingTemplate(false);
    }
  };

  /* ===============================
     UPLOAD
  ================================ */
  const handleUpload = () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }
    dispatch(bulkUploadEmployees(file));
  };

  /* ===============================
     SUCCESS HANDLING
     ✅ FIX: Read failed_employees from result.data (correct API path)
     ✅ FIX: Only close modal if there are NO row errors
     If there are failed rows — stay open so user can click "View Errors"
  ================================ */
  useEffect(() => {
    if (result?.success === true) {
      // ✅ FIX: failed_employees lives at result.data.failed_employees
      const failedRows = result?.data?.failed_employees || [];

      if (failedRows.length === 0) {
        // ✅ Clean success — close modal
        toast.success(
          `Successfully uploaded ${result?.data?.successful || 0} employee(s)`
        );
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        dispatch(resetBulkUploadState());
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        // ✅ Partial success — stay open, let user click "View Errors"
        toast.warning(
          `${failedRows.length} row(s) failed. Check errors before re-uploading.`
        );
        // Do NOT call onClose() — modal stays open
      }
    }
  }, [result, dispatch, onSuccess, onClose]);

  /* ===============================
     CLOSE HANDLER
  ================================ */
  const handleClose = () => {
    handleRemoveFile();
    setShowErrorModal(false);
    onClose();
  };

  /* ===============================
     ERROR EXTRACTION
     ✅ FIX: Read failed_employees from result.data (correct API path)
  ================================ */
  const failedEmployees = result?.data?.failed_employees || [];
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
            disabled={downloadingTemplate || loading}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              .xlsx / .xls | Max 5MB | Max 500 rows
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              hidden
              disabled={loading}
              onChange={handleFileChange}
            />
          </label>

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

        {/* API ERROR (no row errors) */}
        {error && !hasRowErrors && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm font-medium text-red-700">Upload Failed</p>
            <p className="text-xs text-red-600 mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        )}

        {/* PARTIAL SUCCESS SUMMARY — stays visible, user clicks to view errors */}
        {hasRowErrors && (
          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded flex items-center justify-between">
            <p className="text-sm text-yellow-800 font-medium">
              {`${result?.data?.successful || 0} uploaded successfully. ${failedEmployees.length} row(s) have validation errors.`}
            </p>
            <button
              onClick={() => setShowErrorModal(true)}
              className="text-sm text-blue-600 underline font-medium hover:text-blue-800 ml-4 flex-shrink-0"
            >
              View Errors
            </button>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Upload Guidelines:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
            <li>File format: Excel (.xlsx or .xls)</li>
            <li>Maximum file size: 5MB</li>
            <li>Maximum rows: 500</li>
            <li>Download template for correct format</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Uploading..." : "Upload Employees"}
          </button>
        </div>

        {/* ERROR DETAILS MODAL — only opens when user clicks "View Errors" */}
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