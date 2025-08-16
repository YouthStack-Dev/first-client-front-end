import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import { getTitleFromPath, pathTitleMap } from "./utility";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const mainContentRef = useRef(null);
  const [mounted, setMounted] = useState(false);

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


// Inside your Layout component
const location = useLocation();



const title = getTitleFromPath(location.pathname);


  return (
    <div
      className={`h-screen flex overflow-hidden bg-gray-100 ${
        mounted ? "transition-opacity duration-500 opacity-100" : "opacity-0"
      }`}
    >
      <Sidebar
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
        <Header toggleSidebar={toggleSidebar} title={title} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 pb-6">
          <div className="w-full mx-auto ">
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

export default Layout;