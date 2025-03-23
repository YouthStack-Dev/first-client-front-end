

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import { ROLES } from './utils/auth';
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ManageDrivers from './pages/ManageDrivers';
import { Provider } from 'react-redux';
import store from './store/store';
import Routing from './pages/Routing';

// Layout component for authenticated pages

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const mainContentRef = useRef(null);

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && // Only on mobile
          sidebarOpen && // Only when sidebar is open
          mainContentRef.current && 
          mainContentRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      <div 
        ref={mainContentRef}
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        <div className="bg-white shadow-sm p-4 flex items-center lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors "
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Placeholder components
const Clients = () => <h1 className="text-2xl font-bold">Clients</h1>;
const Vehicles = () => <h1 className="text-2xl font-bold">Vehicles</h1>;
const Bookings = () => <h1 className="text-2xl font-bold">Bookings</h1>;
const Vendors = () => <h1 className="text-2xl font-bold">Vendors</h1>;
const Home=() => <h1 className="text-2xl font-bold">This is the landing page </h1>;
function App() {
  return (
    <Provider store={store}>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */} 
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Home/>} />


             {/* Protected Routes */}
            <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/bookings" element={<Bookings />} />
              </Route>

              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]} />}>
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/vehicle-contract" element={<h1> this is vehicle contarct  management </h1>} />
                <Route path="/vehicle-group" element={<h1> this is vehicle group  management </h1>} />
                <Route path="/drivers" element={<ManageDrivers />} />
              </Route>


              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/routing" element={<Routing/>} />
                <Route path="/company-admins" element={<h1> this iscompany-admins management by suberadmin</h1>} />
                <Route path="/subadmins" element={<h1> this is subadmin management by suberadmin</h1>} />
              </Route>



            </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </Provider>
  );
}

export default App;
