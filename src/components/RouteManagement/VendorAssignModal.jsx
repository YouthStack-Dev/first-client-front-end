import React, { useState, useEffect, useCallback } from "react";
import { X, Search, Truck } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client"; // Adjust path as needed
import { logDebug } from "@utils/logger";

const VendorAssignModal = ({
  isOpen,
  onClose,
  selectedRoutes,
  onAssignVendor,
  isAssigning = false,
}) => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vendors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);

      logDebug("Fetching vendors from API...");
      const response = await API_CLIENT.get("/v1/vendors/"); // Adjust endpoint as needed

      logDebug("Vendors API response:", response.data);

      if (response.data?.success) {
        const vendorsData = response.data.data?.items || [];
        setVendors(vendorsData);
        logDebug("Vendors set successfully:", vendorsData);
      } else {
        throw new Error(response.data?.message || "Failed to fetch vendors");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch vendors"
      );
      setVendors([]); // Ensure vendors is empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter vendors based on search
  useEffect(() => {
    if (!vendors || vendors.length === 0) {
      setFilteredVendors([]);
      return;
    }

    if (searchTerm) {
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.vendor_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.phone?.includes(searchTerm)
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchTerm, vendors]);

  const handleAssign = () => {
    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    onAssignVendor({
      vendor: selectedVendor,
      routeIds: Array.from(selectedRoutes),
      notes: notes.trim() || null,
    });
  };

  const handleClose = useCallback(() => {
    setSelectedVendor(null);
    setSearchTerm("");
    setNotes("");
    setError(null);
    onClose();
  }, [onClose]);

  const handleRetry = () => {
    setError(null);
    fetchVendors();
  };

  if (!isOpen) return null;

  // Helper function to get vendor display info
  const getVendorDisplayInfo = (vendor) => {
    return {
      name: vendor.name || "Unknown Vendor",
      vendorCode: vendor.vendor_code || "No code",
      email: vendor.email || "No email",
      phone: vendor.phone || "No phone",
      isActive: vendor.is_active !== false,
      vehicleType: vendor.vehicle_type || "Not specified", // Add if your API provides this
      capacity: vendor.capacity || "Not specified", // Add if your API provides this
      rating: vendor.rating || "N/A", // Add if your API provides this
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Assign Vendor to Routes
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isAssigning}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Selected Routes Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              Selected Routes ({selectedRoutes.size})
            </h3>
            <p className="text-sm text-blue-600">
              Assigning vendor to {selectedRoutes.size} route
              {selectedRoutes.size !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading vendors...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Vendor Search - Only show when not loading and no error */}
          {!loading && !error && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Search Vendors
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by vendor name, code, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vendors List */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Available Vendors ({filteredVendors.length})
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {vendors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No vendors available</p>
                      <p className="text-sm mt-1">
                        No vendors found in the system
                      </p>
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No vendors found matching your search
                    </div>
                  ) : (
                    filteredVendors.map((vendor) => {
                      const displayInfo = getVendorDisplayInfo(vendor);
                      return (
                        <div
                          key={vendor.vendor_id}
                          onClick={() => setSelectedVendor(vendor)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedVendor?.vendor_id === vendor.vendor_id
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          } ${
                            !displayInfo.isActive
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {displayInfo.name}
                                </h4>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {displayInfo.vendorCode}
                                </span>
                                {!displayInfo.isActive && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  📧 {displayInfo.email}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  📞 {displayInfo.phone}
                                </span>
                                {/* Add vehicle info if available in your API */}
                                {displayInfo.vehicleType && (
                                  <>
                                    <span>•</span>
                                    <span>{displayInfo.vehicleType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                selectedVendor?.vendor_id === vendor.vendor_id
                                  ? "bg-blue-500"
                                  : "border-2 border-gray-300"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isAssigning}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={
              !selectedVendor ||
              isAssigning ||
              !getVendorDisplayInfo(selectedVendor).isActive
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning...
              </div>
            ) : (
              `Assign ${
                selectedVendor
                  ? getVendorDisplayInfo(selectedVendor).name
                  : "Vendor"
              }`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorAssignModal;
