import React, { useState, useEffect } from "react";
import {
  Building2,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  Eye,
  Plus,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Link2,
} from "lucide-react";
import { transportData } from "../staticData/transportData";

const SuperAdminDashboard = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions] = useState([
    {
      icon: Plus,
      label: "Add Company",
      path: "/superadmin/companies/add",
      color: "blue",
    },
    {
      icon: Plus,
      label: "Add Vendor",
      path: "/superadmin/vendors/add",
      color: "green",
    },
    {
      icon: Link2,
      label: "Assign Partnership",
      path: "/superadmin/partnerships/assign",
      color: "purple",
    },
    {
      icon: Eye,
      label: "View Reports",
      path: "/superadmin/reports",
      color: "orange",
    },
  ]);
  const stats = transportData ? transportData.getStats() : {};

  useEffect(() => {
    // Load statistics

    // Generate recent activity (mock data)
    setRecentActivity([
      {
        type: "company",
        action: "created",
        name: "ABC Logistics",
        time: "2 minutes ago",
        icon: Building2,
        color: "blue",
      },
      {
        type: "vendor",
        action: "registered",
        name: "City Truckers",
        time: "15 minutes ago",
        icon: Truck,
        color: "green",
      },
      {
        type: "partnership",
        action: "assigned",
        name: "ABC Logistics ↔ City Truckers",
        time: "1 hour ago",
        icon: Link2,
        color: "purple",
      },
      {
        type: "payment",
        action: "received",
        name: "$2,500 from XYZ Transport",
        time: "3 hours ago",
        icon: DollarSign,
        color: "green",
      },
      {
        type: "system",
        action: "update",
        name: "Platform updated to v2.1.0",
        time: "5 hours ago",
        icon: Activity,
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Building2}
            label="Total Companies"
            value={stats?.totalCompanies}
            change={12.5}
            changeType="increase"
            color="blue"
          />
          <StatCard
            icon={Truck}
            label="Total Vendors"
            value={stats.totalVendors}
            change={8.3}
            changeType="increase"
            color="green"
          />
          <StatCard
            icon={Users}
            label="Active Users"
            value="1,284"
            change={5.2}
            changeType="increase"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            label="Monthly Revenue"
            value="$185K"
            change={15.7}
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

        {/* Partnership Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-app-text-primary">
              Partnership Overview
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
            <div className="bg-sidebar-primary-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  Total Partnerships
                </div>
                <Link2 className="w-4 h-4 text-sidebar-primary-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.totalAssignments}
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                18% from last month
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  Active Companies
                </div>
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.companiesWithVendors}
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                22% from last month
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-app-text-secondary">
                  Active Vendors
                </div>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-app-text-primary mt-2">
                {stats.vendorsWithCompanies}
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                15% from last month
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
            <h2 className="text-xl font-semibold text-app-text-primary mb-4">
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">API Services</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Email Service</span>
                </div>
                <span className="text-xs text-yellow-600">Degraded</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Payment Gateway</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-app-border">
            <h2 className="text-xl font-semibold text-app-text-primary mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-sidebar-primary-50 rounded-lg">
                <div className="p-2 bg-sidebar-primary-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-sidebar-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Monthly Maintenance</div>
                  <div className="text-xs text-app-text-secondary">
                    Tomorrow, 2:00 AM - 4:00 AM
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Q2 Performance Review
                  </div>
                  <div className="text-xs text-app-text-secondary">
                    In 3 days, 10:00 AM
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Security Audit</div>
                  <div className="text-xs text-app-text-secondary">
                    Next week
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

export default SuperAdminDashboard;
