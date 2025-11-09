import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  Eye,
  FileText,
  MapPin,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Users,
  MessageCircle,
  Settings,
} from "lucide-react";
import { transportData } from "../staticData/transportData";

const VendorDashboard = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions] = useState([
    {
      icon: FileText,
      label: "New Shipment",
      path: "/vendor/shipments/new",
      color: "blue",
    },
    { icon: Eye, label: "View Orders", path: "/vendor/orders", color: "green" },
    {
      icon: DollarSign,
      label: "Payment History",
      path: "/vendor/payments",
      color: "purple",
    },
    {
      icon: MessageCircle,
      label: "Customer Messages",
      path: "/vendor/messages",
      color: "orange",
    },
  ]);

  const stats = transportData ? transportData.getStats() : {};

  useEffect(() => {
    // Generate recent activity specific to vendor
    setRecentActivity([
      {
        type: "shipment",
        action: "created",
        name: "Shipment #TRK-2847",
        time: "30 minutes ago",
        icon: Truck,
        color: "blue",
      },
      {
        type: "payment",
        action: "received",
        name: "$1,250 from ABC Logistics",
        time: "2 hours ago",
        icon: DollarSign,
        color: "green",
      },
      {
        type: "order",
        action: "assigned",
        name: "New order from XYZ Corp",
        time: "4 hours ago",
        icon: Package,
        color: "purple",
      },
      {
        type: "rating",
        action: "received",
        name: "4.8★ from Global Shipping",
        time: "1 day ago",
        icon: TrendingUp,
        color: "orange",
      },
      {
        type: "maintenance",
        action: "scheduled",
        name: "Vehicle maintenance due",
        time: "2 days ago",
        icon: Settings,
        color: "gray",
      },
    ]);
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeType,
    color = "blue",
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div
          className={`text-sm font-medium ${
            changeType === "increase" ? "text-green-600" : "text-red-600"
          }`}
        >
          {changeType === "increase" ? (
            <ArrowUp className="w-4 h-4 inline mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 inline mr-1" />
          )}
          {change}%
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-app-text-primary">{value}</div>
        <div className="text-sm text-app-text-secondary mt-1">{label}</div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, label, path, color }) => (
    <button
      className={`bg-white rounded-xl p-4 shadow-md border border-app-border hover:shadow-lg transition-all duration-200 group`}
    >
      <div
        className={`p-2 rounded-lg bg-${color}-100 group-hover:bg-${color}-200 transition-colors`}
      >
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="mt-3 text-sm font-medium text-app-text-primary">
        {label}
      </div>
    </button>
  );

  const ActivityItem = ({ icon: Icon, type, action, name, time, color }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-app-border last:border-b-0">
      <div className={`p-2 rounded-lg bg-${color}-100 mt-0.5`}>
        <Icon className={`w-4 h-4 text-${color}-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-app-text-primary truncate">
          {name}
        </div>
        <div className="text-xs text-app-text-secondary mt-1">
          {action} • {time}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-background p-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-app-text-primary">
              Vendor Dashboard
            </h1>
            <p className="text-app-text-secondary mt-2">
              Welcome back! Here's your shipping performance overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-secondary" />
              <input
                type="text"
                placeholder="Search shipments..."
                className="pl-10 pr-4 py-2 border border-app-border rounded-lg focus:ring-2 focus:ring-sidebar-primary-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 border border-app-border rounded-lg hover:bg-white transition-colors">
              <Filter className="w-4 h-4 text-app-text-secondary" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Truck}
            label="Active Shipments"
            value={stats?.activeShipments || "24"}
            change={8.3}
            changeType="increase"
            color="blue"
          />
          <StatCard
            icon={Package}
            label="Completed This Month"
            value={stats?.completedShipments || "156"}
            change={12.5}
            changeType="increase"
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Monthly Revenue"
            value={`$${stats?.monthlyRevenue || "42.5K"}`}
            change={15.7}
            changeType="increase"
            color="purple"
          />
          <StatCard
            icon={Users}
            label="Partner Companies"
            value={stats?.partnerCompanies || "18"}
            change={5.2}
            changeType="increase"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
              <h2 className="text-xl font-semibold text-app-text-primary mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app-text-primary">
                  Recent Activity
                </h2>
                <button className="text-sidebar-primary-600 hover:text-sidebar-primary-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-app-text-primary">
              Shipment Overview
            </h2>
            <div className="flex items-center space-x-3">
              <button className="flex items-center text-sm text-sidebar-primary-600 hover:text-sidebar-primary-700">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button className="p-2 hover:bg-app-background rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-app-text-secondary" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  Pending Shipments
                </div>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.pendingShipments || "8"}
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowDown className="w-3 h-3 mr-1" />
                12% from last week
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  On-time Delivery
                </div>
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.onTimeDelivery || "94"}%
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                3% from last month
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  Customer Rating
                </div>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.customerRating || "4.7"}/5
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                0.2 from last month
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Status & Upcoming Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fleet Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
            <h2 className="text-xl font-semibold text-app-text-primary mb-4">
              Fleet Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Available Vehicles
                  </span>
                </div>
                <span className="text-xs text-green-600">
                  {stats.availableVehicles || "12"} units
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">On Route</span>
                </div>
                <span className="text-xs text-blue-600">
                  {stats.vehiclesOnRoute || "8"} units
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Maintenance</span>
                </div>
                <span className="text-xs text-yellow-600">
                  {stats.vehiclesInMaintenance || "2"} units
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Out of Service</span>
                </div>
                <span className="text-xs text-red-600">
                  {stats.vehiclesOutOfService || "1"} unit
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
            <h2 className="text-xl font-semibold text-app-text-primary mb-4">
              Upcoming Schedule
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Shipment to Chicago</div>
                  <div className="text-xs text-app-text-secondary">
                    Tomorrow, 8:00 AM • #TRK-2850
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Vehicle Inspection</div>
                  <div className="text-xs text-app-text-secondary">
                    In 2 days, 10:00 AM
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">License Renewal</div>
                  <div className="text-xs text-app-text-secondary">
                    Next week
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Meeting with ABC Logistics
                  </div>
                  <div className="text-xs text-app-text-secondary">
                    Friday, 2:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
