import React, { useState, useEffect } from "react";
import {
  Users,
  Car,
  Bus,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TrackingManagement from "../pages/TrackingManagement";
import StatsCard from "../components/ui/StatsCard";
import { API_CLIENT } from "../Api/API_Client";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

const CompanyDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin = currentUser?.type === "admin";
  const tenantId =
    currentUser?.employee?.tenant_id ||
    currentUser?.vendor_user?.tenant_id ||
    currentUser?.tenant_id ||
    "";

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ── Fetch dashboard summary ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const params = new URLSearchParams();
        if (isAdmin && tenantId) params.append("tenant_id", tenantId);

        const response = await API_CLIENT.get(
          `/dashboard/summary${params.toString() ? `?${params}` : ""}`
        );

        if (response.data?.success) {
          setSummary(response.data.data);
        } else {
          setApiError("Failed to load dashboard data");
        }
      } catch (err) {
        setApiError(
          err?.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [tenantId]);

  // ── Build stats from API response ────────────────────────────────────────
  const stats = summary
    ? [
        {
          title: "Total Bookings",
          value: summary.bookings.total,
          key: "bookings",
          icon: Calendar,
          change: {
            value: summary.bookings.completion_rate_pct,
            isPositive: true,
            label: "completion rate",
          },
        },
        {
          title: "Ongoing Routes",
          value: summary.routes.ongoing,
          key: "routes",
          icon: MapPin,
          change: {
            value: summary.routes.total,
            isPositive: true,
            label: "total routes today",
          },
        },
        {
          title: "Active Drivers",
          value: summary.fleet.active_drivers,
          key: "drivers",
          icon: Users,
          change: {
            value: summary.fleet.active_vendors,
            isPositive: true,
            label: "active vendors",
          },
        },
        {
          title: "Active Vehicles",
          value: summary.fleet.active_vehicles,
          key: "vehicles",
          icon: Car,
          change: {
            value: summary.fleet.active_vendors,
            isPositive: true,
            label: "active vendors",
          },
        },
        {
          title: "Employees Active",
          value: summary.employees.active,
          key: "employees",
          icon: Users,
          change: {
            value: 0,
            isPositive: true,
            label: "today",
          },
        },
        {
          title: "Completed Bookings",
          value: summary.bookings.by_status?.Completed ?? 0,
          key: "completed",
          icon: CheckCircle,
          change: {
            value: summary.bookings.by_status?.Cancelled ?? 0,
            isPositive: false,
            label: "cancelled today",
          },
        },
        {
          title: "Scheduled Bookings",
          value: summary.bookings.by_status?.Scheduled ?? 0,
          key: "scheduled",
          icon: Calendar,
          change: {
            value: summary.bookings.by_status?.Ongoing ?? 0,
            isPositive: true,
            label: "ongoing now",
          },
        },
        {
          title: "Total Shifts",
          value: summary.shifts.total,
          key: "shifts",
          icon: Bus,
          change: {
            value: summary.shifts.breakdown?.IN?.total ?? 0,
            isPositive: true,
            label: "login shifts",
          },
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-background via-app-surface to-app-background">
      <div className="p-6 mx-auto">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-app-text-primary">
              Key Metrics
            </h2>
          </div>

          {/* Error banner */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-app-surface rounded-xl shadow-sm p-6 border border-app-border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Skeleton
                        width={120}
                        height={20}
                        baseColor="#e0f2fe"
                        highlightColor="#f1f5f9"
                      />
                      <Skeleton
                        circle
                        width={32}
                        height={32}
                        baseColor="#e0f2fe"
                        highlightColor="#f1f5f9"
                      />
                    </div>
                    <Skeleton
                      width={80}
                      height={32}
                      baseColor="#e0f2fe"
                      highlightColor="#f1f5f9"
                      className="mb-2"
                    />
                    <Skeleton
                      width={60}
                      height={16}
                      baseColor="#e0f2fe"
                      highlightColor="#f1f5f9"
                    />
                  </div>
                ))
              : stats.map((stat) => (
                  <StatsCard
                    key={stat.key}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    change={stat.change}
                  />
                ))}
          </div>
        </div>

        {/* Live Tracking Section */}
        <TrackingManagement />
      </div>
    </div>
  );
};

export default CompanyDashboard;