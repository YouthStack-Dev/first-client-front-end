import React from 'react';

// Reusable skeleton components for consistent loading states across the app
export const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div className={`${width} ${height} bg-slate-300 rounded animate-pulse ${className}`}></div>
);

export const SkeletonCircle = ({ size = "w-10 h-10", className = "" }) => (
  <div className={`${size} bg-slate-300 rounded-full animate-pulse ${className}`}></div>
);

export const SkeletonCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 space-y-3 ${className}`}>
    {children}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 border-b bg-gray-50">
      <div className="flex space-x-4">
        {[...Array(columns)].map((_, i) => (
          <SkeletonLine key={i} width="w-24" height="h-5" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex space-x-4">
            {[...Array(columns)].map((_, colIndex) => (
              <SkeletonLine key={colIndex} width="w-24" height="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <SkeletonLine width="w-48" height="h-8" />
      <SkeletonLine width="w-32" height="h-10" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i}>
          <div className="flex items-center justify-between">
            <SkeletonLine width="w-16" height="h-6" />
            <SkeletonCircle size="w-8 h-8" />
          </div>
          <SkeletonLine width="w-20" height="h-8" />
          <SkeletonLine width="w-32" height="h-4" />
        </SkeletonCard>
      ))}
    </div>
    
    {/* Chart */}
    <SkeletonCard className="h-96">
      <SkeletonLine width="w-32" height="h-6" />
      <div className="flex-1 bg-slate-200 rounded animate-pulse"></div>
    </SkeletonCard>
  </div>
);