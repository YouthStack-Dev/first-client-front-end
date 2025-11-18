import React from "react";
import { Zap, Shield, MapPin, Clock } from "lucide-react";

const FeaturesGrid = () => {
  const features = [
    {
      icon: Zap,
      title: "Fast Booking",
      description: "Quick and intuitive",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Safe Rides",
      description: "Verified drivers",
      color: "green",
    },
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "Real-time updates",
      color: "purple",
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Always available",
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div
              className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}
            >
              <Icon className={`w-5 h-5 text-${feature.color}-600`} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-xs">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesGrid;
