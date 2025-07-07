// src/components/dashboards/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, X, AlertCircle } from 'lucide-react';
import { ROLES } from '../../utils/auth';


const AdminDashboard = () => {
  const user = useSelector((state) => state.user?.user) || { role: ROLES.SUPER_ADMIN };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [focusedInput, setFocusedInput] = useState(null); // Track focused input for suggestions

  const vehicleInputRef = useRef(null);
  const employeeInputRef = useRef(null);
  const tripInputRef = useRef(null);

  const stats = [
    { title: 'Women Traveling Alone', value: '1', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR] },
    { title: 'Delayed Vehicles', value: '3', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR] },
    { title: 'Ongoing Planned Trips', value: '4', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR] },
    { title: 'Ongoing Adhoc Trips', value: '0', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR] },
    { title: 'In Premises Vehicles', value: '2', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR] },
    { title: 'Scheduled Trips', value: '-', key: 'scheduled', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    { title: ' Future Bookings', value: '-', key: 'future', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  ];

  const dummyVehicles = [
    { id: 'V001', licensePlate: 'KA01AB1234' },
    { id: 'V002', licensePlate: 'MH12CD5678' },
    { id: 'V003', licensePlate: 'DL04EF4321' },
  ];

  const dummyEmployees = [
    { id: 'E101', name: 'Alice Johnson', phone: '9876543210', email: 'alice@example.com' },
    { id: 'E102', name: 'Bob Smith', phone: '9123456780', email: 'bob@example.com' },
    { id: 'E103', name: 'Charlie Brown', phone: '9988776655', email: 'charlie@example.com' },
  ];

  const dummyTrips = [
    { id: 'T001', description: 'Morning trip to office' },
    { id: 'T002', description: 'Evening drop to home' },
    { id: 'T003', description: 'Adhoc visit to vendor site' },
  ];

  const openModal = (title) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFocusedInput(null); // Close suggestions when modal opens
  };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.altKey && e.key.toLowerCase() === 'q') {
          vehicleInputRef.current?.focus();
          setFocusedInput('vehicle');
        } else if (e.ctrlKey && e.key.toLowerCase() === 'e') {
          employeeInputRef.current?.focus();
          setFocusedInput('employee');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredVehicles = dummyVehicles.filter(
      (v) =>
        v.id.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase())
    );

    const filteredEmployees = dummyEmployees.filter(
      (e) =>
        e.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.phone.includes(employeeSearch) ||
        e.email.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const filteredTrips = dummyTrips.filter((t) =>
      t.id.toLowerCase().includes(tripSearch.toLowerCase())
    );

  const handleSuggestionClick = (type, value) => {
    if (type === 'vehicle') {
      setVehicleSearch(value.id);
    } else if (type === 'employee') {
      setEmployeeSearch(value.id);
    } else if (type === 'trip') {
      setTripSearch(value.id);
    }
    setFocusedInput(null); // Close dropdown
  };
    return (
      <div className=" bg-gray-100 p-6">
      <div className=" mx-auto">
        

        {/* Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Vehicle Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle ID / License Plate (Alt+Q)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                onFocus={() => setFocusedInput('vehicle')}
                onBlur={() => setTimeout(() => setFocusedInput(null), 200)} // Delay to allow click
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                id="vehicleSearch"
                ref={vehicleInputRef}
              />
              {vehicleSearch && (
                <button
                  onClick={() => setVehicleSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {focusedInput === 'vehicle' && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((v) => (
                    <li
                      key={v.id}
                      onClick={() => handleSuggestionClick('vehicle', v)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                    >
                      <span>{v.id}</span>
                      <span className="text-gray-500">{v.licensePlate}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> No vehicles found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Employee Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID, Name, Phone, Email (Ctrl+E)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                onFocus={() => setFocusedInput('employee')}
                onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                id="employeeSearch"
                ref={employeeInputRef}
              />
              {employeeSearch && (
                <button
                  onClick={() => setEmployeeSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {focusedInput === 'employee' && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((e) => (
                    <li
                      key={e.id}
                      onClick={() => handleSuggestionClick('employee', e)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                    >
                      <span>{e.id}</span>
                      <span className="text-gray-500">{e.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> No employees found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Trip Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search trips..."
                value={tripSearch}
                onChange={(e) => setTripSearch(e.target.value)}
                onFocus={() => setFocusedInput('trip')}
                onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                ref={tripInputRef}
              />
              {tripSearch && (
                <button
                  onClick={() => setTripSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {focusedInput === 'trip' && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => handleSuggestionClick('trip', t)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                    >
                      <span>{t.id}</span>
                      <span className="text-gray-500">{t.description}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> No trips found
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) =>
            stat.roles.includes(user?.role) ? (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <h3 className="text-sm font-medium text-gray-500 mb-3">{stat.title}</h3>
                <button
                  onClick={() => openModal(stat.title)}
                  className="text-2xl font-bold text-blue-600 hover:text-blue-800 focus:outline-none transition"
                >
                  {stat.value}
                </button>
              </div>
            ) : null
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">This feature is under development.</p>
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };
  
  export default AdminDashboard;
  