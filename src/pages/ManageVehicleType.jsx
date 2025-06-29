import { useState } from "react";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
import { Modal, InputField } from "../components/SmallComponents";
import DynamicTable from "../components/DynamicTable";


const ManageVehicleTypes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);

  const initialFormData = {
    vehicleTypeName: "",
    description: "",
    capacity: "",
    fuelType: "",
    comment: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const fuelTypeOptions = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

  const formFields = [
    {
      label: "Vehicle Type Name *",
      name: "vehicleTypeName",
      type: "text",
      placeholder: "Enter Vehicle Type Name",
      required: true,
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      placeholder: "Enter Description",
      rows: 4,
    },
    {
      label: "Capacity *",
      name: "capacity",
      type: "number",
      placeholder: "Enter Capacity",
      required: true,
      min: 1,
    },
    {
      label: "Fuel Type *",
      name: "fuelType",
      type: "select",
      options: fuelTypeOptions,
      required: true,
    },
    {
      label: "Comment",
      name: "comment",
      type: "textarea",
      placeholder: "Enter Comment",
      rows: 3,
    },
  ];

  const headers = [
    { label: 'Vehicle Type Name', key: 'vehicleType', className: 'w-1/4' },
    { label: 'Description', key: 'description', className: 'w-1/3' },
    { label: 'Total Capacity', key: 'totalCap', className: 'w-1/6' },
    { label: 'Fuel Type', key: 'fuleType', className: 'w-1/6' },
  ];

  const sampleData = [
    { id: 1, vehicleType: 'Sedan', description: 'Comfortable 4-seater vehicle suitable for city travel.', totalCap: 4, fuleType: 'Petrol' },
    { id: 2, vehicleType: 'SUV', description: 'Spacious vehicle with high ground clearance.', totalCap: 7, fuleType: 'Diesel' },
    { id: 3, vehicleType: 'Hatchback', description: 'Compact vehicle ideal for small families.', totalCap: 4, fuleType: 'Petrol' },
    { id: 4, vehicleType: 'Mini Bus', description: 'Can carry up to 16 passengers, best for group travel.', totalCap: 16, fuleType: 'Diesel' },
    { id: 5, vehicleType: 'Electric Car', description: 'Eco-friendly vehicle with zero emissions.', totalCap: 5, fuleType: 'Electric' },
    { id: 6, vehicleType: 'Convertible', description: 'Stylish vehicle, great for scenic drives.', totalCap: 2, fuleType: 'Petrol' },
    { id: 7, vehicleType: 'Pickup Truck', description: 'Suitable for transporting goods and materials.', totalCap: 2, fuleType: 'Diesel' },
    { id: 8, vehicleType: 'Van', description: 'Used for logistics and commercial delivery.', totalCap: 8, fuleType: 'Diesel' },
    { id: 9, vehicleType: 'Luxury Sedan', description: 'Premium interior and smooth driving experience.', totalCap: 4, fuleType: 'Petrol' },
    { id: 10, vehicleType: 'Auto Rickshaw', description: 'Common three-wheeled transport in urban areas.', totalCap: 3, fuleType: 'CNG' }
  ];

  const itemsPerPage = 5;
  const totalPages = Math.ceil(sampleData.length / itemsPerPage);
  const paginatedData = sampleData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const onPrev = () => currentPage > 1 && setCurrentPage(p => p - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  return (
    <>
      <HeaderWithActionNoRoute
        title="Manage Vehicle Types"
        buttonLabel="Add"
        onButtonClick={() => setIsModalOpen(true)}
      />

      {/* Table Section */}
      <div className="bg-white shadow rounded p-4 mt-4 overflow-auto max-h-[600px]">
        <DynamicTable
          headers={headers}
          data={paginatedData}
          menuOpen={menuOpen}
          onMenuToggle={setMenuOpen}
          onNext={onNext}
          onPrev={onPrev}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>

      {/* Modal for Add Vehicle Type */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title="Add Vehicle Type"
      >
        <div className="space-y-4">
          {formFields.map((field) => {
            if (field.type === "textarea") {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              );
            }

            return (
              <InputField
                key={field.name}
                label={field.label}
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                option={field.options}
                required={field.required}
                min={field.min}
              />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default ManageVehicleTypes;
