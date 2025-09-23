import { Building2, Shield, UserCheck, UserCog, Users, UserX } from "lucide-react";




const StatsCard = ({ title, value, icon: Icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

// src/components/dashboards/SuperAdminDashboard.jsx
const SuperAdminDashboard = () => {
  const statsData = [
    {
      title: "Total Clients",
      value: 15,
      icon: Building2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Active Clients",
      value: 9,
      icon: Users,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Available Modules",
      value: 12,
      icon: Shield,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];
  
  const stats = {
    total: 20,
    active: 12,
    onDuty: 5,
    inactive: 3,
  };
    return (
      <div className="p-4">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {statsData.map((stat, index) => (
    <StatsCard
      key={index}
      title={stat.title}
      value={stat.value}
      icon={stat.icon}
      iconBg={stat.iconBg}
      iconColor={stat.iconColor}
    />
  ))}
</div>

    </div>
    );
  };
  
  export default SuperAdminDashboard;
  
  