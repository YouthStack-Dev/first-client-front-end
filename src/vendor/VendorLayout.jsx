import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
// import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import { useLocation } from "react-router-dom";
import VendorSideBar from "./VendorSideBar";

// Static title mapping for vendor routes
const vendorPathTitleMap = {
  "/vendor/dashboard": "Dashboard",
  "/vendor/vehicles": "Vehicle Management",
  "/vendor/vehicles/add": "Add Vehicle",
  "/vendor/vehicles/edit": "Edit Vehicle",
  "/vendor/drivers": "Driver Management",
  "/vendor/drivers/add": "Add Driver",
  "/vendor/drivers/edit": "Edit Driver",
  "/vendor/routes": "Route Management",
  "/vendor/routes/add": "Add Route",
  "/vendor/routes/edit": "Edit Route",
  "/vendor/trips": "Trip Management",
  "/vendor/trips/active": "Active Trips",
  "/vendor/trips/completed": "Completed Trips",
  "/vendor/bookings": "Booking Management",
  "/vendor/bookings/pending": "Pending Bookings",
  "/vendor/bookings/confirmed": "Confirmed Bookings",
  "/vendor/documents": "Document Management",
  "/vendor/documents/vehicle": "Vehicle Documents",
  "/vendor/documents/driver": "Driver Documents",
  "/vendor/reports": "Reports & Analytics",
  "/vendor/reports/trips": "Trip Reports",
  "/vendor/reports/revenue": "Revenue Reports",
  "/vendor/settings": "Settings",
  "/vendor/profile": "Company Profile",
  "/vendor/users": "User Management",
};

const getTitleFromVendorPath = (pathname) => {
  return vendorPathTitleMap[pathname] || "Vendor Portal";
};

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const mainContentRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle outside click to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 1024 &&
        sidebarOpen &&
        mainContentRef.current &&
        mainContentRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const title = getTitleFromVendorPath(location.pathname);

  return (
    <div
      className={`h-screen flex overflow-hidden bg-gray-50 ${
        mounted ? "transition-opacity duration-500 opacity-100" : "opacity-0"
      }`}
    >
      <VendorSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      <div
        ref={mainContentRef}
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Header */}
        <VendorHeader toggleSidebar={toggleSidebar} title={title} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 pb-6">
          <div className="w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-600 opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default VendorLayout;