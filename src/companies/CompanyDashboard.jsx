import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  AlertCircle,
  Car,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import LiveTracking from "../pages/LiveTracking";
import TrackingManagement from "../pages/TrackingManagement";
// import LiveTracking from "./LiveTracking";

const CompanyDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const vehicleInputRef = useRef(null);
  const employeeInputRef = useRef(null);
  const tripInputRef = useRef(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setStatsLoaded(true), 300);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Women Traveling Alone",
      value: "12",
      key: "women",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      trend: "+8%",
    },
    {
      title: "Delayed Vehicles",
      value: "3",
      key: "delayed",
      icon: Clock,
      color: "from-red-500 to-red-600",
      trend: "-12%",
    },
    {
      title: "Ongoing Planned Trips",
      value: "24",
      key: "planned",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      trend: "+15%",
    },
    {
      title: "Ongoing Adhoc Trips",
      value: "8",
      key: "adhoc",
      icon: MapPin,
      color: "from-orange-500 to-orange-600",
      trend: "+5%",
    },
    {
      title: "In Premises Vehicles",
      value: "18",
      key: "premises",
      icon: Car,
      color: "from-green-500 to-green-600",
      trend: "+2%",
    },
    {
      title: "Scheduled Trips",
      value: "156",
      key: "scheduled",
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      trend: "+20%",
    },
    {
      title: "Future Bookings",
      value: "89",
      key: "future",
      icon: TrendingUp,
      color: "from-teal-500 to-teal-600",
      trend: "+25%",
    },
    {
      title: "Active Employees",
      value: "342",
      key: "employees",
      icon: Users,
      color: "from-pink-500 to-pink-600",
      trend: "+3%",
    },
  ];

  const dummyVehicles = [
    {
      id: "V001",
      licensePlate: "KA01AB1234",
      status: "Active",
      driver: "John Doe",
    },
    {
      id: "V002",
      licensePlate: "MH12CD5678",
      status: "On Trip",
      driver: "Jane Smith",
    },
    {
      id: "V003",
      licensePlate: "DL04EF4321",
      status: "Maintenance",
      driver: "Bob Johnson",
    },
    {
      id: "V004",
      licensePlate: "TN09XY9876",
      status: "Active",
      driver: "Alice Brown",
    },
  ];

  const dummyEmployees = [
    {
      id: "E101",
      name: "Alice Johnson",
      phone: "9876543210",
      email: "alice@company.com",
      department: "Engineering",
    },
    {
      id: "E102",
      name: "Bob Smith",
      phone: "9123456780",
      email: "bob@company.com",
      department: "Marketing",
    },
    {
      id: "E103",
      name: "Charlie Brown",
      phone: "9988776655",
      email: "charlie@company.com",
      department: "Sales",
    },
    {
      id: "E104",
      name: "Diana Prince",
      phone: "9555666777",
      email: "diana@company.com",
      department: "HR",
    },
  ];

  const dummyTrips = [
    {
      id: "T001",
      description: "Morning office commute",
      route: "Home → Office",
      status: "Completed",
    },
    {
      id: "T002",
      description: "Evening return journey",
      route: "Office → Home",
      status: "In Progress",
    },
    {
      id: "T003",
      description: "Client meeting - Downtown",
      route: "Office → Client Site",
      status: "Scheduled",
    },
    {
      id: "T004",
      description: "Airport pickup",
      route: "Airport → Office",
      status: "Pending",
    },
  ];

  const openModal = (title) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFocusedInput(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        vehicleInputRef.current?.focus();
        setFocusedInput("vehicle");
      } else if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        employeeInputRef.current?.focus();
        setFocusedInput("employee");
      } else if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        tripInputRef.current?.focus();
        setFocusedInput("trip");
      } else if (e.key === "Escape") {
        setFocusedInput(null);
        if (modalOpen) closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const filteredVehicles = dummyVehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.driver.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredEmployees = dummyEmployees.filter(
    (e) =>
      e.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.phone.includes(employeeSearch) ||
      e.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const filteredTrips = dummyTrips.filter(
    (t) =>
      t.id.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const handleSuggestionClick = (type, value) => {
    if (type === "vehicle") {
      setVehicleSearch(value.id);
    } else if (type === "employee") {
      setEmployeeSearch(value.id);
    } else if (type === "trip") {
      setTripSearch(value.id);
    }
    setFocusedInput(null);
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
  );

  const SearchInput = ({
    label,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    inputRef,
    suggestions,
    onSuggestionClick,
    type,
    shortcut,
  }) => (
    <div className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-gray-900 transition-colors">
        {label}
        <span className="text-xs font-normal text-gray-500 ml-2">
          ({shortcut})
        </span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl 
                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                   hover:border-gray-300 transition-all duration-200 
                   bg-white/50 backdrop-blur-sm shadow-sm
                   placeholder-gray-400"
          ref={inputRef}
        />
        {value && (
          <button
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute inset-y-0 right-0 pr-4 flex items-center 
                     text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {suggestions && (
        <div
          className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-md 
                      border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-auto
                      animate-in slide-in-from-top-2 duration-200"
        >
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSuggestionClick(type, item)}
                className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer transition-colors
                         first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0
                         flex items-center justify-between group/item"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 group-hover/item:text-blue-600">
                    {item.id}
                  </span>
                  <span className="text-sm text-gray-500">
                    {type === "vehicle"
                      ? `${item.licensePlate} • ${item.driver}`
                      : type === "employee"
                      ? `${item.name} • ${item.department}`
                      : `${item.description} • ${item.status}`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 flex items-center rounded-xl">
              <AlertCircle className="w-4 h-4 mr-2" />
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-6 mx-auto">
        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <SearchInput
              label="Vehicle Search"
              placeholder="Search by ID, license plate, or driver..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              onFocus={() => setFocusedInput("vehicle")}
              onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
              inputRef={vehicleInputRef}
              suggestions={focusedInput === "vehicle" ? filteredVehicles : null}
              onSuggestionClick={handleSuggestionClick}
              type="vehicle"
              shortcut="Alt+Q"
            />

            <SearchInput
              label="Employee Search"
              placeholder="Search by ID, name, phone, or email..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              onFocus={() => setFocusedInput("employee")}
              onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
              inputRef={employeeInputRef}
              suggestions={
                focusedInput === "employee" ? filteredEmployees : null
              }
              onSuggestionClick={handleSuggestionClick}
              type="employee"
              shortcut="Ctrl+E"
            />

            <SearchInput
              label="Trip Search"
              placeholder="Search by trip ID or description..."
              value={tripSearch}
              onChange={(e) => setTripSearch(e.target.value)}
              onFocus={() => setFocusedInput("trip")}
              onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
              inputRef={tripInputRef}
              suggestions={focusedInput === "trip" ? filteredTrips : null}
              onSuggestionClick={handleSuggestionClick}
              type="trip"
              shortcut="Alt+T"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div
                      key={stat.key}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 
                             overflow-hidden group cursor-pointer border border-gray-100
                             ${
                               statsLoaded
                                 ? "animate-in slide-in-from-bottom-4"
                                 : ""
                             }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => openModal(stat.title)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors">
                            {stat.title}
                          </h3>
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} 
                                      shadow-lg transform group-hover:scale-110 transition-transform duration-200`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div
                            className="text-3xl font-bold text-gray-900 mb-1 
                                      group-hover:text-blue-600 transition-colors duration-200"
                          >
                            {stat.value}
                          </div>
                          <div
                            className="text-xs font-medium text-green-600 bg-green-50 
                                      px-2 py-1 rounded-full"
                          >
                            {stat.trend}
                          </div>
                        </div>
                      </div>
                      <div
                        className="h-1 bg-gradient-to-r from-gray-100 to-gray-200 
                                  group-hover:from-blue-500 group-hover:to-blue-600 
                                  transition-all duration-300"
                      ></div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Live Tracking Section */}
        <TrackingManagement />

        {/* Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50
                        animate-in fade-in duration-200"
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl 
                          animate-in slide-in-from-bottom-8 zoom-in-95 duration-300
                          border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalTitle}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                           rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-8">
                <div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 
                              rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 leading-relaxed">
                  This feature is currently under development. Our team is
                  working hard to bring you detailed analytics and management
                  capabilities for this metric.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 
                           hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white rounded-xl hover:from-blue-700 hover:to-blue-800 
                           focus:outline-none focus:ring-4 focus:ring-blue-500/20
                           transition-all duration-200 font-medium shadow-lg
                           hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
