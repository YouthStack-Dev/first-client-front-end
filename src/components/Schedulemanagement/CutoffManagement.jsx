import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormField } from "../../redux/features/cutoff/cutoffSlice";
import {
  fetchCutoffsThunk,
  fetchEscortConfigThunk,
  saveCutoffThunk,
  saveEscortConfigThunk,
} from "../../redux/features/cutoff/cutofftrunk";
import {
  Save,
  Clock,
  Calendar,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Settings,
  Zap,
  Shield,
  Activity,
  UserCheck,
  Users,
  Building,
} from "lucide-react";
import { logDebug } from "../../utils/logger";
import ReusableButton from "../ui/ReusableButton";

const CutoffManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("cutoff");
  const [activeCutoffTab, setActiveCutoffTab] = useState("standard");

  const { formData, status, error, data, escortStatus, escortError } =
    useSelector((state) => state.cutoff);

  const {
    booking_login_cutoff,
    cancel_login_cutoff,
    booking_logout_cutoff,
    cancel_logout_cutoff,
    medical_emergency_booking_cutoff,
    adhoc_booking_cutoff,
    allow_adhoc_booking,
    allow_medical_emergency_booking,
    escort_required_start_time,
    escort_required_end_time,
    escort_required_for_women,
    login_boarding_otp,
    login_deboarding_otp,
    logout_boarding_otp,
    logout_deboarding_otp,
  } = formData || {};

  useEffect(() => {
    if (!data) {
      dispatch(fetchCutoffsThunk());
    }
    // Always fetch escort config
    dispatch(fetchEscortConfigThunk());
  }, [dispatch, data]);

  const handleToggle = (fieldName) => {
    logDebug(" the toggle form data ", fieldName);

    // First update the form field in local state
    const newValue = !formData[fieldName];
    dispatch(
      updateFormField({
        name: fieldName,
        value: newValue,
      })
    );

    // For tenant tab, save tenant-specific fields
    if (activeTab === "tenant") {
      const tenantData = {
        escort_required_start_time,
        escort_required_end_time,
        escort_required_for_women: newValue,
        login_boarding_otp,
        login_deboarding_otp,
        logout_boarding_otp,
        logout_deboarding_otp,
      };
      // Update the field that was toggled
      tenantData[fieldName] = newValue;
      dispatch(saveEscortConfigThunk(tenantData));
    }
  };

  const handleTimeChange = (fieldName, hours, minutes) => {
    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
    dispatch(updateFormField({ name: fieldName, value: formattedTime }));
  };

  const handleFullTimeChange = (fieldName, hours, minutes, seconds = "00") => {
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds}`;
    dispatch(updateFormField({ name: fieldName, value: formattedTime }));
  };

  const handleSaveCutoff = () => {
    // Save only cutoff config
    const cutoffData = {
      booking_login_cutoff,
      cancel_login_cutoff,
      booking_logout_cutoff,
      cancel_logout_cutoff,
      medical_emergency_booking_cutoff,
      adhoc_booking_cutoff,
      allow_adhoc_booking,
      allow_medical_emergency_booking,
    };
    dispatch(saveCutoffThunk(cutoffData));
  };

  const handleSaveTenant = () => {
    // Save tenant configuration
    const tenantData = {
      escort_required_start_time,
      escort_required_end_time,
      escort_required_for_women,
      login_boarding_otp,
      login_deboarding_otp,
      logout_boarding_otp,
      logout_deboarding_otp,
    };
    dispatch(saveEscortConfigThunk(tenantData));
  };

  const parseTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0 };
    const [hours, minutes] = timeString.split(":").map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  const parseFullTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0 };
    const parts = timeString.split(":");
    return {
      hours: parseInt(parts[0]) || 0,
      minutes: parseInt(parts[1]) || 0,
    };
  };

  // Check if there are changes for cutoff tab
  const hasCutoffChanges = () => {
    if (!data) return false;

    const cutoffFields = [
      "booking_login_cutoff",
      "cancel_login_cutoff",
      "booking_logout_cutoff",
      "cancel_logout_cutoff",
      "medical_emergency_booking_cutoff",
      "adhoc_booking_cutoff",
      "allow_adhoc_booking",
      "allow_medical_emergency_booking",
    ];

    return cutoffFields.some((key) => formData[key] !== data[key]);
  };

  // Check if there are changes for tenant tab
  const hasTenantChanges = () => {
    if (!data) return false;

    const tenantFields = [
      "escort_required_start_time",
      "escort_required_end_time",
      "escort_required_for_women",
      "login_boarding_otp",
      "login_deboarding_otp",
      "logout_boarding_otp",
      "logout_deboarding_otp",
    ];

    return tenantFields.some((key) => formData[key] !== data[key]);
  };

  const isSaving = (tab) => {
    if (tab === "tenant") {
      return escortStatus === "saving";
    }
    return status === "saving";
  };

  const getCurrentStatus = (tab) => {
    if (tab === "tenant") {
      return escortStatus;
    }
    return status;
  };

  const getCurrentError = (tab) => {
    if (tab === "tenant") {
      return escortError;
    }
    return error;
  };

  const StatusBanner = ({ tab }) => {
    const currentStatus = getCurrentStatus(tab);
    const currentError = getCurrentError(tab);

    if (currentStatus === "loading") {
      return (
        <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded text-xs flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-900 font-medium">Loading...</span>
        </div>
      );
    }

    if (currentStatus === "failed") {
      return (
        <div className="bg-red-50 border border-red-200 px-3 py-2 rounded text-xs mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-900 font-medium">Error: {currentError}</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentStatus === "saved") {
      return (
        <div className="bg-green-50 border border-green-200 px-3 py-2 rounded text-xs flex items-center gap-2 mb-4">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          <p className="text-green-900 font-medium">
            {tab === "tenant" ? "Tenant config" : "Cutoff config"} saved
            successfully
          </p>
        </div>
      );
    }

    return null;
  };

  // Reset saved status when switching tabs
  useEffect(() => {
    if (status === "saved") {
      setTimeout(() => {
        // You can dispatch an action to reset status if needed
      }, 3000);
    }
    if (escortStatus === "saved") {
      setTimeout(() => {
        // dispatch(setEscortStatus("idle"));
      }, 3000);
    }
  }, [status, escortStatus, dispatch]);

  // Component definitions
  const CompactTimeInput = ({ label, fieldName, currentValue, icon: Icon }) => {
    const { hours, minutes } = parseTime(currentValue);

    return (
      <div className="flex items-center gap-2 py-2 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2">
        <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <label className="text-xs font-medium text-gray-700 min-w-[140px]">
          {label}
        </label>
        <div className="flex gap-2 ml-auto">
          <select
            value={hours}
            onChange={(e) =>
              handleTimeChange(fieldName, parseInt(e.target.value), minutes)
            }
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white"
          >
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i} value={i}>
                {i}h
              </option>
            ))}
          </select>
          <select
            value={minutes}
            onChange={(e) =>
              handleTimeChange(fieldName, hours, parseInt(e.target.value))
            }
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white"
          >
            {[0, 15, 30, 45].map((min) => (
              <option key={min} value={min}>
                {min}m
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const CompactFullTimeInput = ({
    label,
    fieldName,
    currentValue,
    icon: Icon,
  }) => {
    const { hours, minutes } = parseFullTime(currentValue);

    return (
      <div className="flex items-center gap-2 py-2 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2">
        <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <label className="text-xs font-medium text-gray-700 min-w-[140px]">
          {label}
        </label>
        <div className="flex gap-2 ml-auto">
          <select
            value={hours}
            onChange={(e) =>
              handleFullTimeChange(fieldName, parseInt(e.target.value), minutes)
            }
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}h
              </option>
            ))}
          </select>
          <select
            value={minutes}
            onChange={(e) =>
              handleFullTimeChange(fieldName, hours, parseInt(e.target.value))
            }
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white"
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}m
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const CompactToggle = ({ label, enabled, onChange, description }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          enabled ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  if (!data && status !== "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h1 className="text-sm font-semibold text-gray-900">
              Configuration Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "cutoff" && (
              <ReusableButton
                module="cutoff"
                action="update"
                buttonName={
                  isSaving("cutoff") ? "Saving..." : "Save Cutoff Changes"
                }
                icon={isSaving("cutoff") ? null : Save}
                onClick={handleSaveCutoff}
                disabled={!hasCutoffChanges() || isSaving("cutoff")}
                isLoading={isSaving("cutoff")}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1.5"
              />
            )}
            {activeTab === "tenant" && (
              <ReusableButton
                module="tenant_config"
                action="read"
                buttonName={
                  isSaving("tenant") ? "Saving..." : "Save Tenant Changes"
                }
                icon={isSaving("tenant") ? null : Save}
                onClick={handleSaveTenant}
                disabled={!hasTenantChanges() || isSaving("tenant")}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1.5"
              >
                {isSaving("tenant") && (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
                )}
              </ReusableButton>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-4">
        <StatusBanner tab={activeTab} />

        {/* Main Tabs */}
        <div className="flex gap-1 mb-4 bg-white p-1 rounded border border-gray-200">
          <button
            onClick={() => setActiveTab("cutoff")}
            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "cutoff"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3" />
              Cutoff Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab("tenant")}
            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "tenant"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Building className="w-3 h-3" />
              Tenant Management
            </div>
          </button>
        </div>

        {/* Cutoff Management Tab */}
        {activeTab === "cutoff" && (
          <>
            {/* Cutoff Sub-tabs */}
            <div className="flex gap-1 mb-4 bg-white p-1 rounded border border-gray-200">
              <button
                onClick={() => setActiveCutoffTab("standard")}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeCutoffTab === "standard"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Standard
                </div>
              </button>
              <button
                onClick={() => setActiveCutoffTab("special")}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeCutoffTab === "special"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  Special
                </div>
              </button>
              <button
                onClick={() => setActiveCutoffTab("overview")}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeCutoffTab === "overview"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  Overview
                </div>
              </button>
            </div>

            {/* Standard Cutoff Tab */}
            {activeCutoffTab === "standard" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Booking Cutoffs
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <CompactTimeInput
                      label="Login Booking"
                      fieldName="booking_login_cutoff"
                      currentValue={booking_login_cutoff}
                      icon={Clock}
                    />
                    <CompactTimeInput
                      label="Logout Booking"
                      fieldName="booking_logout_cutoff"
                      currentValue={booking_logout_cutoff}
                      icon={Clock}
                    />
                  </div>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Cancellation Cutoffs
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <CompactTimeInput
                      label="Login Cancellation"
                      fieldName="cancel_login_cutoff"
                      currentValue={cancel_login_cutoff}
                      icon={XCircle}
                    />
                    <CompactTimeInput
                      label="Logout Cancellation"
                      fieldName="cancel_logout_cutoff"
                      currentValue={cancel_logout_cutoff}
                      icon={XCircle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special Cutoff Tab */}
            {activeCutoffTab === "special" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Shield className="w-4 h-4 text-red-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Medical Emergency
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <CompactTimeInput
                      label="Emergency Cutoff"
                      fieldName="medical_emergency_booking_cutoff"
                      currentValue={medical_emergency_booking_cutoff}
                      icon={Shield}
                    />
                    <CompactToggle
                      label="Enable Medical Emergency"
                      enabled={allow_medical_emergency_booking}
                      onChange={() =>
                        handleToggle("allow_medical_emergency_booking")
                      }
                    />
                  </div>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Adhoc Shifts
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <CompactTimeInput
                      label="Adhoc Cutoff"
                      fieldName="adhoc_booking_cutoff"
                      currentValue={adhoc_booking_cutoff}
                      icon={Zap}
                    />
                    <CompactToggle
                      label="Enable Adhoc Booking"
                      enabled={allow_adhoc_booking}
                      onChange={() => handleToggle("allow_adhoc_booking")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeCutoffTab === "overview" && (
              <div className="bg-white rounded border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Configuration Summary
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Login Book
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {booking_login_cutoff}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Login Cancel
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cancel_login_cutoff}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Logout Book
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {booking_logout_cutoff}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Logout Cancel
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cancel_logout_cutoff}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">
                    Special Configurations
                  </h3>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Medical Emergency
                        </p>
                        <p className="text-gray-600">
                          {medical_emergency_booking_cutoff}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        allow_medical_emergency_booking
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {allow_medical_emergency_booking ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Adhoc Booking
                        </p>
                        <p className="text-gray-600">{adhoc_booking_cutoff}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        allow_adhoc_booking
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {allow_adhoc_booking ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tenant Management Tab */}
        {activeTab === "tenant" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Escort Requirements
                </h2>
              </div>
              <div className="space-y-1">
                <CompactFullTimeInput
                  label="Start Time"
                  fieldName="escort_required_start_time"
                  currentValue={escort_required_start_time}
                  icon={Clock}
                />
                <CompactFullTimeInput
                  label="End Time"
                  fieldName="escort_required_end_time"
                  currentValue={escort_required_end_time}
                  icon={Clock}
                />
                <CompactToggle
                  label="Required for Women"
                  enabled={escort_required_for_women}
                  onChange={() => handleToggle("escort_required_for_women")}
                  description="Mandatory escort during specified hours"
                />
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <Shield className="w-4 h-4 text-green-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  OTP Requirements
                </h2>
              </div>
              <div className="space-y-1">
                <CompactToggle
                  label="Login Boarding OTP"
                  enabled={login_boarding_otp}
                  onChange={() => handleToggle("login_boarding_otp")}
                  description="Require OTP for boarding during login"
                />
                <CompactToggle
                  label="Login Deboarding OTP"
                  enabled={login_deboarding_otp}
                  onChange={() => handleToggle("login_deboarding_otp")}
                  description="Require OTP for deboarding during login"
                />
                <CompactToggle
                  label="Logout Boarding OTP"
                  enabled={logout_boarding_otp}
                  onChange={() => handleToggle("logout_boarding_otp")}
                  description="Require OTP for boarding during logout"
                />
                <CompactToggle
                  label="Logout Deboarding OTP"
                  enabled={logout_deboarding_otp}
                  onChange={() => handleToggle("logout_deboarding_otp")}
                  description="Require OTP for deboarding during logout"
                />
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <Activity className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Configuration Summary
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700 mb-1 text-xs">
                      Escort Active Period
                    </p>
                    <p className="text-sm font-semibold">
                      {escort_required_start_time} - {escort_required_end_time}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700 mb-1 text-xs">
                      Escort Status
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        escort_required_for_women
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {escort_required_for_women ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700 mb-1 text-xs">
                      OTP Status Summary
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Login Boarding:</span>
                        <span
                          className={
                            login_boarding_otp
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {login_boarding_otp ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Login Deboarding:</span>
                        <span
                          className={
                            login_deboarding_otp
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {login_deboarding_otp ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logout Boarding:</span>
                        <span
                          className={
                            logout_boarding_otp
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {logout_boarding_otp ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logout Deboarding:</span>
                        <span
                          className={
                            logout_deboarding_otp
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {logout_deboarding_otp ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutoffManagement;
