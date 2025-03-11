

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import { ROLES } from './utils/auth';

// Layout component for authenticated pages
const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-gray-100 p-6">
        <Outlet /> {/* This allows dynamic rendering of child routes */}
      </div>
    </div>
  );
};

// Placeholder components
const Clients = () => <h1 className="text-2xl font-bold">Clients</h1>;
const Vehicles = () => <h1 className="text-2xl font-bold">Vehicles</h1>;
const Bookings = () => <h1 className="text-2xl font-bold">Bookings</h1>;
const Vendors = () => <h1 className="text-2xl font-bold">Vendors</h1>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

             {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/bookings" element={<Bookings />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]} />}>
                <Route path="/vehicles" element={<Vehicles />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
                <Route path="/vendors" element={<Vendors />} />
              </Route>
            </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
