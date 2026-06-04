import React, { useState, useEffect, useRef } from "react";
import {
  X,
  TrendingUp,
  Shield,
  Gauge,
  Users,
  Car,
  Bus,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TrackingManagement from "../pages/TrackingManagement";
import StatsCard from "../components/ui/StatsCard";
import { API_CLIENT } from "../Api/API_Client";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin = currentUser?.type === "admin";
  const tenantId =
    currentUser?.employee?.tenant_id ||
    currentUser?.vendor_user?.tenant_id ||
    currentUser?.tenant_id ||
    "";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [apiError, setApiError] = useState(null);

  const vehicleInputRef = useRef(null);
  const employeeInputRef = useRef(null);
  const tripInputRef = useRef(null);

  // ── Fetch dashboard summary ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const params = new URLSearchParams();
        if (isAdmin && tenantId) params.append("tenant_id", tenantId);

        const response = await API_CLIENT.get(
          `/dashboard/summary${params.toString() ? `?${params}` : ""}`,
        );

        if (response.data?.success) {
          setSummary(response.data.data);
        } else {
          setApiError("Failed to load dashboard data");
        }
      } catch (err) {
        setApiError(
          err?.response?.data?.message || "Failed to load dashboard data",
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
        // ✅ Speed Violations — navigates to its own page
        {
          title: "Speed Violations",
          value: "View",
          key: "violations",
          icon: Gauge,
          change: {
            value: 0,
            isPositive: false,
            label: "click to view all",
          },
        },
      ]
    : [];

  const openModal = (title) => {
    setModalTitle(title);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setFocusedInput(null);
  };

  const handleCardClick = (stat) => {
    if (stat.key === "violations") {
      navigate("/companies/speed-violations");
    } else {
      openModal(stat.title);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        vehicleInputRef.current?.focus();
        setFocusedInput("vehicle");
      } else if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        employeeInputRef.current?.focus();
        setFocusedInput("employee");
      } else if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        tripInputRef.current?.focus();
        setFocusedInput("trip");
      } else if (e.key === "Escape") {
        setFocusedInput(null);
        if (modalOpen) closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-background via-app-surface to-app-background">
      <div className="p-6 mx-auto">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-app-text-primary">
              Key Metrics
            </h2>
            {/* Cache status badge */}
            {/* {summary?.cache_status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                summary.cache_status === "hit"
                  ? "bg-green-100 text-green-700"
                  : summary.cache_status === "throttled"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {summary.cache_status === "hit"      && "⚡ Cached"}
                {summary.cache_status === "miss"     && "🔄 Live"}
                {summary.cache_status === "throttled" && "⏳ Throttled"}
              </span>
            )} */}
          </div>

          {/* Error banner */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 9 }).map((_, index) => (
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
                    onClick={() => handleCardClick(stat)}
                  />
                ))}
          </div>
        </div>

        {/* Live Tracking Section */}
        <TrackingManagement />

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-app-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-300 border border-app-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-app-text-primary">
                  {modalTitle}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-app-text-muted hover:text-app-text-secondary hover:bg-app-tertiary rounded-xl transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-app-text-secondary leading-relaxed">
                  This feature is currently under development. Our team is
                  working hard to bring you detailed analytics and management
                  capabilities for this metric.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-app-text-secondary hover:text-app-text-primary hover:bg-app-tertiary rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary text-white rounded-xl hover:from-sidebar-secondary hover:to-sidebar-primary focus:outline-none focus:ring-4 focus:ring-sidebar-secondary/20 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
