import { Pencil } from "lucide-react";
import FormField from "../../components/ui/FormFields";
import { useEffect, useState } from "react";

const DriverPersonalDetails = ({
  formData,
  errors,
  onChange,
  onImageChange,
  onCheckboxChange,
  loading = false,
  mode,
}) => {
  const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
      if (formData.photo instanceof File) {
        // Local preview for newly uploaded file
        const objectUrl = URL.createObjectURL(formData.photo);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else if (formData.photo) {
        // Backend string (URL or base64)
        setPreviewUrl(typeof formData.photo === "string" ? `https://api.gocab.tech/api/v1/${formData.photo}` : "");
      } else {
        setPreviewUrl("");
      }
    }, [formData.photo]);


  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Profile Image */}
        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center relative mx-auto">
        {previewUrl ? (
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log("Selected file:", file);       // Log file for debugging
              onImageChange(file);                        // Update parent formData
              const objectUrl = URL.createObjectURL(file);
              setPreviewUrl(objectUrl);                   // Update preview immediately
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>


        {/* Driver Name */}
        <FormField label="Driver Name" name="name" required error={errors.name}>
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

        {/* Driver Code */}
        <FormField label="Driver Code" name="code" required error={errors.code}>
          <input
            id="code"
            type="text"
            name="code"
            value={formData.code || ""}
            onChange={onChange}
            placeholder="Enter driver code"
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

        {/* Password (only on create/edit) */}
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

        {/* Gender */}
        <FormField label="Gender" name="gender" required error={errors.gender}>
          <div className="flex space-x-4">
            {["Male", "Female"].map((g) => (
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

        {/* Date of Joining */}
        <FormField
          label="Date of Joining"
          name="date_of_joining"
          required
          error={errors.date_of_joining}
        >
          <input
            id="date_of_joining"
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining || ""}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </FormField>

        {/* Addresses */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-4">
          <FormField
            label="Permanent Address"
            name="permanent_address"
            required
            error={errors.permanent_address}
          >
            <textarea
              id="permanent_address"
              name="permanent_address"
              value={formData.permanent_address || ""}
              onChange={onChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </FormField>

          <FormField
            label="Current Address"
            name="current_address"
            required
            error={errors.current_address}
          >
            <div className="space-y-2">
              {!formData.isSameAddress && (
                <textarea
                  id="current_address"
                  name="current_address"
                  value={formData.current_address || ""}
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
      </div>
    </div>
  );
};

export default DriverPersonalDetails;
