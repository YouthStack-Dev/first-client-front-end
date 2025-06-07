import React from 'react';
import { Users, UserCheck, UserX, UserCog } from 'lucide-react';
import StatsCard from '../ui/StatsCard';

const DriverStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Drivers"
        value={stats.total}
        icon={Users}
        iconColor="text-blue-500"
        change={{ value: 4.2, isPositive: true }}
      />
      <StatsCard
        title="Active Drivers"
        value={stats.active}
        icon={UserCheck}
        iconColor="text-green-500"
        change={{ value: 2.5, isPositive: true }}
      />
      <StatsCard
        title="Inactive Drivers"
        value={stats.inactive}
        icon={UserX}
        iconColor="text-red-500"
        change={{ value: 1.8, isPositive: false }}
      />
      <StatsCard
        title="On-Duty Drivers"
        value={stats.onDuty}
        icon={UserCog}
        iconColor="text-orange-500"
        change={{ value: 3.4, isPositive: true }}
      />
    </div>
  );
};

export default DriverStats;
