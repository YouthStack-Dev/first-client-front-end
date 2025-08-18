// src/components/dashboards/DashboardRouter.jsx
import AdminDashboard from "./AdminDashboard";
import VendorDashboard from "./VendorDashboard";
import ClientDashboard from "./ClientDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

const DashboardRouter = () => {



  // const role = user?.role;
  

  
  const role="SUPER_ADMIN"
  switch (role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    case "VENDOR":
      return <VendorDashboard />;
    case "CLIENT":
      return <ClientDashboard />;
    default:
      return <div className="text-center mt-10 text-red-500">Unauthorized or Unknown Role</div>;
  }
};

export default DashboardRouter;
