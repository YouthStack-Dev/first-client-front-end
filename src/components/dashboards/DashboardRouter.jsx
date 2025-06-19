// src/components/dashboards/DashboardRouter.jsx
import AdminDashboard from "./AdminDashboard";
import VendorDashboard from "./VendorDashboard";
import ClientDashboard from "./ClientDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import { useSelector } from "react-redux";

const DashboardRouter = () => {
  const user = useSelector((state) => state.user.user);



  const role = user?.role;
  
  console.log("User role:", role);
  
  
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
