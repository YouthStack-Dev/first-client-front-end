import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormField } from "../../redux/features/cutoff/cutoffSlice";
import {
  fetchCutoffsThunk,
  saveCutoffThunk,
} from "../../redux/features/cutoff/cutofftrunk";
import {
  Save,
  RotateCcw,
  Clock,
  Calendar,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Settings,
  Zap,
  Shield,
  Activity,
} from "lucide-react";

const CutoffManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("standard");
  const { formData, status, error, data } = useSelector(
    (state) => state.cutoff
  );

  const {
    booking_login_cutoff,
    cancel_login_cutoff,
    booking_logout_cutoff,
    cancel_logout_cutoff,
    medical_emergency_booking_cutoff,
    adhoc_booking_cutoff,
    allow_adhoc_booking,
    allow_medical_emergency_booking,
  } = formData || {};

  useEffect(() => {
    if (!data) dispatch(fetchCutoffsThunk());
  }, [dispatch, data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      updateFormField({
        name,
        value: type === "checkbox" ? checked : value,
      })
    );
  };

  const handleToggle = (fieldName) => {
    dispatch(
      updateFormField({
        name: fieldName,
        value: !formData[fieldName],
      })
    );
  };

  const handleTimeChange = (fieldName, hours, minutes) => {
    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
    dispatch(updateFormField({ name: fieldName, value: formattedTime }));
  };

  const handleSave = () => {
    dispatch(saveCutoffThunk(formData));
  };

  const parseTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0 };
    const [hours, minutes] = timeString.split(":").map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  const hasChanges = data && JSON.stringify(formData) !== JSON.stringify(data);

  const ModernTimeInput = ({ label, fieldName, currentValue, icon: Icon }) => {
    const { hours, minutes } = parseTime(currentValue);

    return (
      <div className="group">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <Icon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900">
              {label}
            </label>
            <p className="text-xs text-gray-500">
              Currently set to {currentValue}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <select
              value={hours}
              onChange={(e) =>
                handleTimeChange(fieldName, parseInt(e.target.value), minutes)
              }
              className="w-full appearance-none px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 font-medium cursor-pointer hover:border-gray-300"
            >
              {Array.from({ length: 25 }, (_, i) => (
                <option key={i} value={i}>
                  {i}h
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>

          <div className="flex-1 relative">
            <select
              value={minutes}
              onChange={(e) =>
                handleTimeChange(fieldName, hours, parseInt(e.target.value))
              }
              className="w-full appearance-none px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 font-medium cursor-pointer hover:border-gray-300"
            >
              {[0, 15, 30, 45].map((min) => (
                <option key={min} value={min}>
                  {min}m
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ModernToggle = ({ label, enabled, onChange, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
          enabled ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  const StatusBanner = () => {
    if (status === "loading") {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-900 font-medium">
              Loading configuration...
            </span>
          </div>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-900 font-semibold">Configuration Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "saved") {
      return (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-900 font-semibold">
              Configuration saved successfully!
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cutoff Management
                </h1>
                <p className="text-sm text-gray-600">
                  Configure booking and cancellation policies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges || status === "saving"}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {status === "saving" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-6 py-8">
        <StatusBanner />

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("standard")}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "standard"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Standard Shifts
            </div>
          </button>
          <button
            onClick={() => setActiveTab("special")}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "special"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Special Bookings
            </div>
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </div>
          </button>
        </div>

        {/* Standard Shifts Tab */}
        {activeTab === "standard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Booking Cutoffs
                  </h2>
                  <p className="text-sm text-gray-600">
                    When booking closes before shift
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ModernTimeInput
                  label="Login Booking Cutoff"
                  fieldName="booking_login_cutoff"
                  currentValue={booking_login_cutoff}
                  icon={Clock}
                />
                <ModernTimeInput
                  label="Logout Booking Cutoff"
                  fieldName="booking_logout_cutoff"
                  currentValue={booking_logout_cutoff}
                  icon={Clock}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Cancellation Cutoffs
                  </h2>
                  <p className="text-sm text-gray-600">
                    Latest time to cancel booking
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ModernTimeInput
                  label="Login Cancellation Cutoff"
                  fieldName="cancel_login_cutoff"
                  currentValue={cancel_login_cutoff}
                  icon={XCircle}
                />
                <ModernTimeInput
                  label="Logout Cancellation Cutoff"
                  fieldName="cancel_logout_cutoff"
                  currentValue={cancel_logout_cutoff}
                  icon={XCircle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Special Bookings Tab */}
        {activeTab === "special" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Medical Emergency
                  </h2>
                  <p className="text-sm text-gray-600">
                    Emergency booking policies
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ModernTimeInput
                  label="Emergency Booking Cutoff"
                  fieldName="medical_emergency_booking_cutoff"
                  currentValue={medical_emergency_booking_cutoff}
                  icon={Shield}
                />
                <ModernToggle
                  label="Enable Medical Emergency Booking"
                  enabled={allow_medical_emergency_booking}
                  onChange={() =>
                    handleToggle("allow_medical_emergency_booking")
                  }
                  description="Allow bookings during medical emergencies"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Adhoc Shifts
                  </h2>
                  <p className="text-sm text-gray-600">
                    Unscheduled shift policies
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ModernTimeInput
                  label="Adhoc Booking Cutoff"
                  fieldName="adhoc_booking_cutoff"
                  currentValue={adhoc_booking_cutoff}
                  icon={Zap}
                />
                <ModernToggle
                  label="Enable Adhoc Booking"
                  enabled={allow_adhoc_booking}
                  onChange={() => handleToggle("allow_adhoc_booking")}
                  description="Allow unscheduled shift bookings"
                />
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Configuration Summary
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                  Login Booking
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {booking_login_cutoff}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-700 uppercase mb-2">
                  Login Cancel
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {cancel_login_cutoff}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                  Logout Booking
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {booking_logout_cutoff}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-700 uppercase mb-2">
                  Logout Cancel
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {cancel_logout_cutoff}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Special Booking Status
              </h3>
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Medical Emergency Booking
                    </p>
                    <p className="text-sm text-gray-600">
                      Cutoff: {medical_emergency_booking_cutoff}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    allow_medical_emergency_booking
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {allow_medical_emergency_booking ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Adhoc Booking</p>
                    <p className="text-sm text-gray-600">
                      Cutoff: {adhoc_booking_cutoff}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    allow_adhoc_booking
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {allow_adhoc_booking ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutoffManagement;
