// src/components/ui/StatusIndicator.jsx
import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const StatusIndicator = ({ label, value, icon, className }) => {
  // Map icon prop to corresponding lucide-react icon
  const iconMap = {
    users: <Users size={20} />,
    'check-circle': <CheckCircle size={20} />,
    clock: <Clock size={20} />,
    'alert-triangle': <AlertTriangle size={20} />,
  };

  return (
    <div
      className={`p-4 rounded-lg shadow flex items-center gap-3 ${className}`}
    >
      <div className="flex-shrink-0">{iconMap[icon]}</div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatusIndicator;