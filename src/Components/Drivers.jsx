import { useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react"; // Import necessary icons
import DocumentUpload from "./DocumentUpload";
import PersionalDetail from "./PersionalDetail";
import DataProvider from "../store/DataProvider";



function Drivers() {
  const [showForm, setShowForm] = useState(true);
  const [activeTab, setActiveTab] = useState(true);

  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "123-456-7890",
      license: "DL123456",
      status: "Active",
      admin: "John Doe",
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah@example.com",
      phone: "987-654-3210",
      license: "DL654321",
      status: "Inactive",
      admin: "Jane Smith",
    },
    {
      id: 3,
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "555-678-1234",
      license: "DL789123",
      status: "Active",
      admin: "John Doe",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "321-987-6543",
      license: "DL321654",
      status: "Active",
      admin: "Robert Brown",
    },
    {
      id: 5,
      name: "James Wilson",
      email: "james@example.com",
      phone: "111-222-3333",
      license: "DL112233",
      status: "Inactive",
      admin: "Jane Smith",
    },
  ]);
  

  const [admins, setAdmins] = useState(["John Doe", "Jane Smith", "Robert Brown"]);

  // Function to handle deletion of a driver
  const handleDelete = (id) => {
    const updatedDrivers = drivers.filter((driver) => driver.id !== id);
    setDrivers(updatedDrivers);
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-blue-500 p-3">
        <h2 className="text-2xl font-bold">Drivers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          {!showForm ? (
            <>
              <X className="mr-2" size={18} />
              Close Form
            </>
          ) : (
            <>
              <Plus className="mr-2" size={18} />
              Add Driver
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <div className="p-1">
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Under
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.license}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="border border-gray-300 rounded px-2 py-1"
                        value={driver.admin}
                        onChange={(e) => {
                          const updatedDrivers = drivers.map((d) =>
                            d.id === driver.id ? { ...d, admin: e.target.value } : d
                          );
                          setDrivers(updatedDrivers);
                        }}
                      >
                        {admins.map((admin, index) => (
                          <option key={index} value={admin}>
                            {admin}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.admin}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
                        <Edit className="mr-1" size={16} />
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 flex items-center"
                        onClick={() => handleDelete(driver.id)}
                      >
                        <Trash className="mr-1" size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <h1 className="text-2xl ml-4 text-tertiary-dark font-bold">
              ADD DRIVER
            </h1>
          </div>

          <div className="mt-3 p-3">
            <nav>
              <button
                onClick={() => setActiveTab(true)}
                className={`${
                  activeTab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 text-lg border-b-4 font-medium`}
              >
                Persional Details
              </button>
              <button
                onClick={() => setActiveTab(false)}
                className={`${
                  !activeTab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-3 text-lg border-b-4 font-medium`}
              >
                Documents
              </button>
            </nav>
          </div>

          <div>{activeTab ? <PersionalDetail/> :<DataProvider><DocumentUpload /> </DataProvider> }</div>
        </>
      )}
    </div>
  );
}

export default Drivers;
