import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import Card from './Card';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  change
}) => {
  return (
    <Card className="flex flex-col transform transition-transform duration-300 hover:scale-105">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
      </div>
      <div className="mt-1">
        <p className="text-2xl font-semibold">{value}</p>
        {change && (
          <p className={`text-sm ${change.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {change.isPositive ? '↑' : '↓'} <span className="ml-1">{Math.abs(change.value)}%</span>
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
