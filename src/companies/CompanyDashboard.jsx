import React, { useState, useEffect, useRef } from "react";
import { X, TrendingUp, Shield } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TrackingManagement from "../pages/TrackingManagement";
import StatsCard from "../components/ui/StatsCard";
// import StatsCard from "../components/StatsCard";

const CompanyDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const vehicleInputRef = useRef(null);
  const employeeInputRef = useRef(null);
  const tripInputRef = useRef(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Women Traveling Alone",
      value: "12",
      key: "women",
      icon: Shield,
      change: {
        value: 8,
        isPositive: true,
        label: "vs last week",
      },
    },
    {
      title: "Total Vehicles",
      value: "24",
      key: "vehicles",
      icon: Shield,
      change: {
        value: 5,
        isPositive: true,
        label: "vs last month",
      },
    },
    {
      title: "Active Trips",
      value: "18",
      key: "trips",
      icon: Shield,
      change: {
        value: 2,
        isPositive: false,
        label: "vs yesterday",
      },
    },
    {
      title: "Employees On Duty",
      value: "156",
      key: "employees",
      icon: Shield,
      change: {
        value: 12,
        isPositive: true,
        label: "vs last week",
      },
    },
    {
      title: "Safety Incidents",
      value: "3",
      key: "incidents",
      icon: Shield,
      change: {
        value: 25,
        isPositive: false,
        label: "vs last month",
      },
    },
    {
      title: "On-time Arrivals",
      value: "94%",
      key: "arrivals",
      icon: Shield,
      change: {
        value: 3,
        isPositive: true,
        label: "vs last week",
      },
    },
    {
      title: "Fuel Efficiency",
      value: "8.2 km/L",
      key: "fuel",
      icon: Shield,
      change: {
        value: 1.2,
        isPositive: true,
        label: "vs last month",
      },
    },
    {
      title: "Driver Rating",
      value: "4.8",
      key: "rating",
      icon: Shield,
      change: {
        value: 0.2,
        isPositive: true,
        label: "vs last quarter",
      },
    },
  ];

  const dummyVehicles = [
    {
      id: "V001",
      licensePlate: "KA01AB1234",
      status: "Active",
      driver: "John Doe",
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
  ];

  const dummyTrips = [
    {
      id: "T001",
      description: "Morning office commute",
      route: "Home → Office",
      status: "Completed",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-background via-app-surface to-app-background">
      <div className="p-6 mx-auto">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-app-text-primary mb-6">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-app-surface rounded-xl shadow-sm p-6 border border-app-border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Skeleton
                        width={120}
                        height={20}
                        baseColor="#e0f2fe"
                        highlightColor="#f1f5f9"
                      />
                      <Skeleton
                        circle
                        width={32}
                        height={32}
                        baseColor="#e0f2fe"
                        highlightColor="#f1f5f9"
                      />
                    </div>
                    <Skeleton
                      width={80}
                      height={32}
                      baseColor="#e0f2fe"
                      highlightColor="#f1f5f9"
                      className="mb-2"
                    />
                    <Skeleton
                      width={60}
                      height={16}
                      baseColor="#e0f2fe"
                      highlightColor="#f1f5f9"
                    />
                  </div>
                ))
              : stats.map((stat) => (
                  <StatsCard
                    key={stat.key}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    change={stat.change}
                    onClick={() => openModal(stat.title)}
                  />
                ))}
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
              className="bg-app-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl 
                          animate-in slide-in-from-bottom-8 zoom-in-95 duration-300
                          border border-app-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-app-text-primary">
                  {modalTitle}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-app-text-muted hover:text-app-text-secondary hover:bg-app-tertiary 
                           rounded-xl transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-8">
                <div
                  className="w-16 h-16 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary 
                              rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-app-text-secondary leading-relaxed">
                  This feature is currently under development. Our team is
                  working hard to bring you detailed analytics and management
                  capabilities for this metric.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-app-text-secondary hover:text-app-text-primary 
                           hover:bg-app-tertiary rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary 
                           text-white rounded-xl hover:from-sidebar-secondary hover:to-sidebar-primary 
                           focus:outline-none focus:ring-4 focus:ring-sidebar-secondary/20
                           transition-all duration-300 font-medium shadow-lg
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
