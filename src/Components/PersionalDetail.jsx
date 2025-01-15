import React, { useState } from "react";
import { Building, IdCard, Mail, Phone, User, Camera, MapPin } from "lucide-react";
import { InputFields, OptionInput } from "./smallcomponents";

const PersionalDetail = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    driverId: "",
    city: "",
    vendor: "",
    currentAddress: "",
    permanentAddress: "",
    gender: "",
    dob: "", // Add this line
  });

  const [isSameAddress, setIsSameAddress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (isSameAddress && name === "currentAddress") {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: value,
      }));
    }
  };

  const handleCheckboxChange = () => {
    setIsSameAddress(!isSameAddress);

    if (!isSameAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: formData.currentAddress,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Form Data:", formData);
  };

  const inputData = [
    {
      id: "first-name",
      label: "First Name",
      placeholder: "Enter First Name",
      type: "text",
      required: true,
      icon: User,
      name: "firstName",
    },
    {
      id: "last-name",
      label: "Last Name",
      placeholder: "Enter Last Name",
      type: "text",
      required: true,
      icon: User,
      name: "lastName",
    },
    {
      id: "BOB",
      label: "Date of Birth",
      placeholder: "Enter DOB",
      type: "date",
      required: true,
      icon: User,
      name: "dob",
    },
    {
      id: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      type: "email",
      required: true,
      icon: Mail,
      name: "email",
    },
    {
      id: "phone-number",
      label: "Phone Number",
      placeholder: "Phone Number",
      type: "tel",
      required: false,
      icon: Phone,
      name: "phoneNumber",
    },
    {
      id: "current-address",
      label: "Current Address",
      placeholder: "Enter Current Address",
      type: "text",
      required: true,
      icon: MapPin,
      name: "currentAddress",
    },
    {
      id: "permanent-address",
      label: "Permanent Address",
      placeholder: "Enter Permanent Address",
      type: "text",
      required: true,
      icon: MapPin,
      name: "permanentAddress",
    },
    {
      id: "driver-id",
      label: "Driver Id",
      placeholder: "Enter Driver Id",
      type: "text",
      required: false,
      icon: IdCard,
      name: "driverId",
    },
  ];

  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
  const vendors = ["Vendor 1", "Vendor 2", "Vendor 3", "Vendor 4"];

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="grid 2xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-2 gap-4">
        {inputData.map((input) => (
          <InputFields
            key={input.id}
            id={input.id}
            label={input.label}
            placeholder={input.placeholder}
            type={input.type}
            required={input.required}
            Icon={input.icon}
            name={input.name}
            value={formData[input.name]}
            onChange={handleChange}
          />
        ))}

        <OptionInput
          options={cities}
          Icon={Building}
          def="Select City"
          required={true}
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
        <OptionInput
          options={vendors}
          Icon={Building}
          def="Select Vendor"
          required={true}
          label="Vendors"
          name="vendor"
          value={formData.vendor}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center p-3">
        <input
          type="checkbox"
          id="same-address"
          checked={isSameAddress}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        <label htmlFor="same-address">Same as Current Address</label>
      </div>

      <div className="p-3">
        <label className="block mb-2 font-medium">Gender</label>
        <div className="flex items-center space-x-4">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={handleChange}
              className="mr-2"
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={handleChange}
              className="mr-2"
            />
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Others"
              checked={formData.gender === "Others"}
              onChange={handleChange}
              className="mr-2"
            />
            Others
          </label>
        </div>
      </div>

    

      <div className="p-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PersionalDetail;
