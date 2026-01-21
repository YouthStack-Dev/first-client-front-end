import React from "react";
import { Card } from "./Card";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-sidebar-primary",
  change,
  onClick,
}) => {
  return (
    <Card
      className={`flex flex-col transform transition-all duration-300 hover:scale-105 cursor-pointer ${
        onClick ? "hover:shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-app-text-secondary">
            {title}
          </h3>
          {Icon && (
            <div className="p-2 rounded-lg bg-sidebar-tertiary">
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
        </div>
        <div className="mt-1">
          <p className="text-2xl font-semibold text-app-text-primary">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <p
                className={`text-sm font-medium ${
                  change.isPositive ? "text-green-600" : "text-red-600"
                } flex items-center`}
              >
                <span
                  className={`mr-1 ${
                    change.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change.isPositive ? "↑" : "↓"}
                </span>
                {Math.abs(change.value)}%
              </p>
              {change.label && (
                <span className="text-xs text-app-text-muted ml-2">
                  {change.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-app-tertiary to-app-border group-hover:from-sidebar-primary group-hover:to-sidebar-secondary transition-all duration-300"></div>
    </Card>
  );
};

export default StatsCard;
