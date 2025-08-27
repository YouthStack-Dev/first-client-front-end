import { Pencil } from "lucide-react";
import FormField from "../FormField";
import { useDispatch, useSelector } from 'react-redux';
import { logDebug } from "../../utils/logger";
import { useEffect, useState } from "react";
import { fetchVendors } from "../../redux/features/manageVendors/vendorThunks";

const DriverPersonalDetails = ({formData,errors,onChange, onImageChange,onCheckboxChange,loading = false,mode}) => {
const [previewUrl, setPreviewUrl] = useState("");
  const dispatch = useDispatch();
  const {vendors }  = useSelector((state)=>state.vendor)

   useEffect(() => {
      if (vendors.length === 0) {
        console.log("fetching vendors...");
        dispatch(fetchVendors());  
      }
    },[vendors,dispatch]);

useEffect(() => {
  if (formData.profileImage instanceof File) {
    // Local preview for uploaded file
    const objectUrl = URL.createObjectURL(formData.profileImage);
    setPreviewUrl(objectUrl);

    // Clean up
    return () => URL.revokeObjectURL(objectUrl);
  } else if (formData.profileImage) {
    // Backend image
    setPreviewUrl(`https://api.gocab.tech/${formData.profileImage}`);
  } else {
    setPreviewUrl("");
  }
}, [formData.profileImage]);

  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Profile Image */}
        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center relative mx-auto">
          {formData.profileImage ? (
            <img  
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center p-4">
              <Pencil className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 mt-2">
                Add image (JPG, JPEG & PNG)
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) =>
              e.target.files?.[0] && onImageChange(e.target.files[0])
            }
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Driver Name */}
        <FormField
          label="Driver Name"
          name="name"
          required
          error={errors.driverName}
        >
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
            placeholder="Enter driver name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* City */}
        <FormField label="City" name="city" required error={errors.city}>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={onChange}
            placeholder="Enter city"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Date of Birth */}
        <FormField
          label="Date of Birth"
          name="dateOfBirth"
          required
          error={errors.dateOfBirth}
        >
          <input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Alternate Mobile Number */}
        <FormField
          label="Alternate Mobile Number"
          name="alternateMobileNumber"
          error={errors.alternateMobileNumber}
        >
          <input
            id="alternateMobileNumber"
            type="tel"
            name="alternateMobileNumber"
            value={formData.alternateMobileNumber || ""}
            onChange={onChange}
            placeholder="Enter alternate mobile number"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Mobile Number */}
        <FormField
          label="Mobile Number"
          name="mobileNumber"
          required
          error={errors.mobileNumber}
        >
          <input
            id="mobileNumber"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber || ""}
            onChange={onChange}
            placeholder="Enter mobile number"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Email */}
        <FormField label="Email" name="email" required error={errors.email}>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email || ""}
            autoComplete="off"
            onChange={onChange}
            placeholder="Enter email"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Password */}

        {(mode === "create" || mode === "edit") && (
  <FormField
    label="Password"
    name="password"
    required
    error={errors.password}
  >
    <input
      id="password"
      type="password"
      name="password"
      value={formData.password || ""}
      autoComplete="new-password"
      onChange={onChange}
      placeholder="Enter password"
      className="w-full p-2 border border-gray-300 rounded-md"
    />
  </FormField>
)}

       

        {/* Vendor */}
        <FormField label="Vendor" name="vendor" required error={errors.vendor}>
          <select
            id="vendor"
            name="vendorId"
            value={formData.vendorId || ""}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Select Vendor</option>
            {loading ? (
              <option disabled>Loading vendors...</option>
            ) : vendors?.length > 0 ? (
              vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))
            ) : (
              <option disabled>No vendors found</option>
            )}
          </select>
        </FormField>

        {/* Driver Code */}
        <FormField
          label="Driver Code"
          name="driver_code"
          required
          error={errors.driver_code}
        >
          <input
            id="driver_code"
            type="text"
            name="driver_code"
            value={formData.driver_code || ""}
            onChange={onChange}
            placeholder="Enter driver code"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Addresses */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-4">
          <FormField
            label="Permanent Address"
            name="permanentAddress"
            error={errors.permanentAddress}
          >
            <textarea
              id="permanentAddress"
              name="permanentAddress"
              value={formData.permanentAddress || ""}
              onChange={onChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </FormField>

          <FormField
            label="Current Address"
            name="currentAddress"
            error={errors.currentAddress}
          >
            <div className="space-y-2">
              {!formData.isSameAddress && (
                <textarea
                  id="currentAddress"
                  name="currentAddress"
                  value={formData.currentAddress || ""}
                  onChange={onChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              )}
              <label className="flex items-center">
                <input
                  id="isSameAddress"
                  type="checkbox"
                  checked={formData.isSameAddress || false}
                  onChange={(e) =>
                    onCheckboxChange("isSameAddress", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600 ml-2">
                  Same as Permanent Address
                </span>
              </label>
            </div>
          </FormField>
        </div>

        {/* Gender */}
        <FormField label="Gender" name="gender" required error={errors.gender}>
          <div className="flex space-x-4">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center space-x-2">
                <input
                  id={`gender-${g}`}
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={onChange}
                  className="text-blue-600"
                />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default DriverPersonalDetails;
