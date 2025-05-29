import { useSelector } from 'react-redux';
import { ROLES } from '../utils/auth';

const Dashboard = () => {
  const user = useSelector((state) => state.user?.user);


  const stats = [
    {
      title: 'Total Vehicles',
      value: '156',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]
    },
    {
      title: 'Active Bookings',
      value: '42',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      title: 'Total Clients',
      value: '89',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      title: 'Total Revenue',
      value: '$45,289',
      roles: [ROLES.SUPER_ADMIN]
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          stat.roles.includes(user?.role) && (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Dashboard