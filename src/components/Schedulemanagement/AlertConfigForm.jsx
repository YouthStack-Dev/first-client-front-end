// AlertConfigForm.js - Updated with debounce and fixed team dropdown
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Select from "react-select";
import { logDebug } from "../../utils/logger";
import { useTeamOptions } from "../../hooks/Teamshook";

const ALERT_TYPES = ["SOS", "MEDICAL", "FIRE", "SAFETY", "SECURITY"];
const CHANNEL_OPTIONS = ["EMAIL", "SMS", "PUSH", "VOICE"];
const SERVICE_TYPES = ["POLICE", "MEDICAL", "FIRE", "SECURITY"];

const defaultRecipient = {
  name: "",
  email: "",
  phone: "",
  role: "",
  channels: [],
};

const defaultEmergencyContact = {
  name: "",
  phone: "",
  service_type: "POLICE",
};

// Select styles for react-select
const selectStyles = {
  control: (base) => ({
    ...base,
    fontSize: "0.875rem",
    minHeight: "36px",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "0.875rem",
  }),
  option: (base) => ({
    ...base,
    fontSize: "0.875rem",
  }),
};

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function AlertConfigForm({
  initialData,
  mode = "create",
  onSave,
  onCancel,
  isOpen = true,
  onSwitchToEdit,
}) {
  const [config, setConfig] = useState({ ...initialData });
  const [activeSection, setActiveSection] = useState("basic");
  const [scopeType, setScopeType] = useState(initialData.scope || "tenant");
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalConfig, setOriginalConfig] = useState({ ...initialData });
  const [searchValue, setSearchValue] = useState(""); // For team search
  const [selectedTeam, setSelectedTeam] = useState(null); // For react-select
  const [shouldFetchTeams, setShouldFetchTeams] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isReadOnly = currentMode === "view";

  // Debounced search value
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Use the team options hook
  const {
    options: teamOptions,
    rawData: teamRawData,
    loading: loadingTeams,
  } = useTeamOptions({
    shouldFetch: shouldFetchTeams && !isReadOnly,
    params: {
      skip: 0,
      limit: 20,
    },
  });

  // Get team name from team data
  const getTeamDisplayName = useCallback((team) => {
    if (!team) return "";

    // Handle different data structures
    if (team.originalData) {
      const original = team.originalData;
      return `${original.name || original.label}${
        original.code ? ` (${original.code})` : ""
      }`;
    }

    if (team.data) {
      return `${team.data.name || team.label}${
        team.data.code ? ` (${team.data.code})` : ""
      }`;
    }

    return team.label || team.name || "";
  }, []);

  // Initialize state
  useEffect(() => {
    setConfig(initialData);
    setOriginalConfig(initialData);
    setCurrentMode(mode);
    setScopeType(initialData.scope || "tenant");

    // Reset team selection
    if (initialData.scope === "team" && initialData.scope_target_id) {
      // We'll fetch and set the team later when options are available
      setSelectedTeam({
        value: initialData.scope_target_id,
        label: "Loading...",
      });
      setShouldFetchTeams(true);
    } else {
      setSelectedTeam(null);
    }
  }, [initialData, mode]);

  // Update selected team when team options are loaded
  // useEffect(() => {
  //   if (
  //     initialData.scope === "team" &&
  //     initialData.scope_target_id &&
  //     teamOptions.length > 0
  //   ) {
  //     const foundTeam = teamOptions.find(
  //       (team) => team.value === initialData.scope_target_id
  //     );

  //     if (foundTeam) {
  //       setSelectedTeam({
  //         value: foundTeam.value,
  //         label: getTeamDisplayName(foundTeam),
  //         originalData: foundTeam,
  //       });
  //     } else if (!loadingTeams) {
  //       // Team not found in current options, try to fetch it specifically
  //       setSelectedTeam({
  //         value: initialData.scope_target_id,
  //         label: "Team not found",
  //       });
  //     }
  //   }
  // }, [teamOptions, initialData, loadingTeams, getTeamDisplayName]);

  // Handle scope type change
  useEffect(() => {
    if (!isReadOnly) {
      setConfig((prev) => ({
        ...prev,
        scope: scopeType,
        scope_target_type: scopeType === "team" ? "team" : null,
        scope_target_id: scopeType === "team" ? prev.scope_target_id : null,
      }));

      if (scopeType !== "team") {
        setSelectedTeam(null);
        setShouldFetchTeams(false);
      } else if (!shouldFetchTeams) {
        // Only enable fetching if not already enabled
        setShouldFetchTeams(true);
      }
    }
  }, [scopeType, isReadOnly, shouldFetchTeams]);

  // Update config when selectedTeam changes
  useEffect(() => {
    if (selectedTeam && !isReadOnly) {
      updateConfig({
        scope_target_id: selectedTeam.value,
        scope_target_type: "team",
      });
    } else if (!selectedTeam && scopeType === "team" && !isReadOnly) {
      updateConfig({
        scope_target_id: null,
        scope_target_type: "team",
      });
    }
  }, [selectedTeam, isReadOnly, scopeType]);

  const updateConfig = (updates) => {
    if (!isReadOnly) {
      setConfig((prev) => ({ ...prev, ...updates }));
    }
  };

  // Handle team search input change
  const handleTeamSearch = (inputValue) => {
    setSearchValue(inputValue);
  };

  // Handle dropdown open/close
  const handleMenuOpen = () => {
    setDropdownOpen(true);
    if (!shouldFetchTeams) {
      setShouldFetchTeams(true);
    }
  };

  const handleMenuClose = () => {
    setDropdownOpen(false);
  };

  // Team select change handler
  const handleTeamChange = (option) => {
    setSelectedTeam(option);
  };

  // Format current options for display

  const getSelectedTeamName = useCallback(() => {
    if (!selectedTeam) return "";
    return getTeamDisplayName(selectedTeam);
  }, [selectedTeam, getTeamDisplayName]);

  const addRecipient = (type) => {
    if (isReadOnly) return;

    const key =
      type === "primary" ? "primary_recipients" : "escalation_recipients";
    updateConfig({
      [key]: [...config[key], { ...defaultRecipient }],
    });
  };

  const removeRecipient = (type, index) => {
    if (isReadOnly) return;

    const key =
      type === "primary" ? "primary_recipients" : "escalation_recipients";
    updateConfig({
      [key]: config[key].filter((_, i) => i !== index),
    });
  };

  const updateRecipient = (type, index, updates) => {
    if (isReadOnly) return;

    const key =
      type === "primary" ? "primary_recipients" : "escalation_recipients";
    const recipients = [...config[key]];
    recipients[index] = { ...recipients[index], ...updates };
    updateConfig({ [key]: recipients });
  };

  const addEmergencyContact = () => {
    if (isReadOnly) return;

    updateConfig({
      emergency_contacts: [
        ...config.emergency_contacts,
        { ...defaultEmergencyContact },
      ],
    });
  };

  const removeEmergencyContact = (index) => {
    if (isReadOnly) return;

    updateConfig({
      emergency_contacts: config.emergency_contacts.filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateEmergencyContact = (index, updates) => {
    if (isReadOnly) return;

    const contacts = [...config.emergency_contacts];
    contacts[index] = { ...contacts[index], ...updates };
    updateConfig({ emergency_contacts: contacts });
  };

  const toggleArrayItem = (array, item) => {
    if (isReadOnly) return array;

    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleEditClick = () => {
    setCurrentMode("edit");
    if (onSwitchToEdit) {
      onSwitchToEdit();
    }
  };

  const handleCancelEdit = () => {
    setConfig(originalConfig);
    setCurrentMode("view");
    setScopeType(originalConfig.scope || "tenant");

    // Reset selected team
    if (originalConfig.scope === "team" && originalConfig.scope_target_id) {
      // Try to find the team in current options first
      const foundTeam = teamOptions.find(
        (team) => team.value === originalConfig.scope_target_id
      );

      if (foundTeam) {
        setSelectedTeam({
          value: foundTeam.value,
          label: getTeamDisplayName(foundTeam),
          originalData: foundTeam,
        });
      } else {
        setSelectedTeam({
          value: originalConfig.scope_target_id,
          label: "Loading...",
        });
        setShouldFetchTeams(true);
      }
    } else {
      setSelectedTeam(null);
      setShouldFetchTeams(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      logDebug("Saving alert configuration:", config);
      onSave(config);
      if (currentMode === "edit") {
        setCurrentMode("view");
      }
    }
  };

  const handleCancel = () => {
    if (currentMode === "edit") {
      handleCancelEdit();
    } else {
      onCancel?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {currentMode === "create"
                  ? "Create Alert Configuration"
                  : currentMode === "edit"
                  ? "Edit Alert Configuration"
                  : "View Alert Configuration"}
              </h1>
              {config.config_name && (
                <p className="text-sm text-blue-100 mt-0.5">
                  {config.config_name}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {currentMode === "view" && (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
              {currentMode !== "view" && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {currentMode === "create" ? "Create" : "Save"}
                  </button>
                </>
              )}
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
              >
                <X size={16} />
                {currentMode === "view" ? "Close" : "Cancel"}
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
              <nav className="flex">
                {["basic", "escalation", "notification"].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeSection === section
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {section === "basic"
                      ? "Basic & Alert Settings"
                      : section === "escalation"
                      ? "Escalation"
                      : "Notification Settings"}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeSection === "basic" && (
                <div className="space-y-6">
                  {/* Scope Selection */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900">
                      Configuration Scope
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="scope"
                            value="tenant"
                            checked={scopeType === "tenant"}
                            onChange={(e) => setScopeType(e.target.value)}
                            disabled={isReadOnly}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Tenant Level
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="scope"
                            value="team"
                            checked={scopeType === "team"}
                            onChange={(e) => setScopeType(e.target.value)}
                            disabled={isReadOnly}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Team Level
                          </span>
                        </label>
                      </div>

                      {scopeType === "team" && (
                        <div className="flex-1">
                          {/* Team Dropdown */}
                          <Select
                            options={teamOptions}
                            value={selectedTeam}
                            onInputChange={handleTeamSearch}
                            onChange={handleTeamChange}
                            onMenuOpen={handleMenuOpen}
                            onMenuClose={handleMenuClose}
                            placeholder="Search or select team..."
                            isSearchable
                            isClearable
                            isDisabled={isReadOnly}
                            isLoading={loadingTeams}
                            styles={selectStyles}
                          />
                        </div>
                      )}
                    </div>

                    {scopeType === "team" && selectedTeam && (
                      <div className="text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-md inline-block">
                        Selected: {getSelectedTeamName()}
                      </div>
                    )}
                  </div>

                  {/* Rest of the form remains the same */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Configuration Name
                      </label>
                      <input
                        type="text"
                        value={config.config_name}
                        onChange={(e) =>
                          updateConfig({ config_name: e.target.value })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="Enter configuration name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <input
                        type="number"
                        value={config.priority}
                        onChange={(e) =>
                          updateConfig({
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={config.description}
                      onChange={(e) =>
                        updateConfig({ description: e.target.value })
                      }
                      disabled={isReadOnly}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Enter description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applicable Alert Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALERT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            !isReadOnly &&
                            updateConfig({
                              applicable_alert_types: toggleArrayItem(
                                config.applicable_alert_types,
                                type
                              ),
                            })
                          }
                          disabled={isReadOnly}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            config.applicable_alert_types.includes(type)
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                          } disabled:cursor-not-allowed`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Recipients Section */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Primary Recipients
                      </h3>
                      {!isReadOnly && (
                        <button
                          onClick={() => addRecipient("primary")}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Recipient
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {config.primary_recipients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
                          No primary recipients added yet
                        </div>
                      ) : (
                        config.primary_recipients.map((recipient, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-md p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-medium text-gray-500">
                                Recipient {index + 1}
                              </span>
                              {!isReadOnly &&
                                config.primary_recipients.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeRecipient("primary", index)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={recipient.name}
                                onChange={(e) =>
                                  updateRecipient("primary", index, {
                                    name: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Name"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                              <input
                                type="text"
                                value={recipient.role}
                                onChange={(e) =>
                                  updateRecipient("primary", index, {
                                    role: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Role"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                              <input
                                type="email"
                                value={recipient.email}
                                onChange={(e) =>
                                  updateRecipient("primary", index, {
                                    email: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Email"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                              <input
                                type="tel"
                                value={recipient.phone}
                                onChange={(e) =>
                                  updateRecipient("primary", index, {
                                    phone: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Phone"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Notification Channels
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {CHANNEL_OPTIONS.map((channel) => (
                                  <button
                                    key={channel}
                                    type="button"
                                    onClick={() =>
                                      !isReadOnly &&
                                      updateRecipient("primary", index, {
                                        channels: toggleArrayItem(
                                          recipient.channels,
                                          channel
                                        ),
                                      })
                                    }
                                    disabled={isReadOnly}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                      recipient.channels.includes(channel)
                                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                    } disabled:cursor-not-allowed`}
                                  >
                                    {channel}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Escalation section */}
              {activeSection === "escalation" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <input
                      type="checkbox"
                      id="enable_escalation"
                      checked={config.enable_escalation}
                      onChange={(e) =>
                        updateConfig({ enable_escalation: e.target.checked })
                      }
                      disabled={isReadOnly}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="enable_escalation"
                      className="text-sm font-medium text-gray-900"
                    >
                      Enable Escalation
                    </label>
                  </div>

                  {config.enable_escalation && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Escalation Threshold (seconds)
                        </label>
                        <input
                          type="number"
                          value={config.escalation_threshold_seconds}
                          onChange={(e) =>
                            updateConfig({
                              escalation_threshold_seconds:
                                parseInt(e.target.value) || 0,
                            })
                          }
                          disabled={isReadOnly}
                          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Escalation Recipients
                          </h3>
                          {!isReadOnly && (
                            <button
                              onClick={() => addRecipient("escalation")}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Plus size={16} />
                              Add Recipient
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {config.escalation_recipients.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
                              No escalation recipients added yet
                            </div>
                          ) : (
                            config.escalation_recipients.map(
                              (recipient, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-md p-4 bg-gray-50"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-medium text-gray-500">
                                      Recipient {index + 1}
                                    </span>
                                    {!isReadOnly && (
                                      <button
                                        onClick={() =>
                                          removeRecipient("escalation", index)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={recipient.name}
                                      onChange={(e) =>
                                        updateRecipient("escalation", index, {
                                          name: e.target.value,
                                        })
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Name"
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                    />
                                    <input
                                      type="text"
                                      value={recipient.role}
                                      onChange={(e) =>
                                        updateRecipient("escalation", index, {
                                          role: e.target.value,
                                        })
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Role"
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                    />
                                    <input
                                      type="email"
                                      value={recipient.email}
                                      onChange={(e) =>
                                        updateRecipient("escalation", index, {
                                          email: e.target.value,
                                        })
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Email"
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                    />
                                    <input
                                      type="tel"
                                      value={recipient.phone}
                                      onChange={(e) =>
                                        updateRecipient("escalation", index, {
                                          phone: e.target.value,
                                        })
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Phone"
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                    />
                                  </div>
                                  <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                      Channels
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {CHANNEL_OPTIONS.map((channel) => (
                                        <button
                                          key={channel}
                                          type="button"
                                          onClick={() =>
                                            !isReadOnly &&
                                            updateRecipient(
                                              "escalation",
                                              index,
                                              {
                                                channels: toggleArrayItem(
                                                  recipient.channels,
                                                  channel
                                                ),
                                              }
                                            )
                                          }
                                          disabled={isReadOnly}
                                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                            recipient.channels.includes(channel)
                                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                          } disabled:cursor-not-allowed`}
                                        >
                                          {channel}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Notification section */}
              {activeSection === "notification" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Channels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CHANNEL_OPTIONS.map((channel) => (
                        <button
                          key={channel}
                          type="button"
                          onClick={() =>
                            !isReadOnly &&
                            updateConfig({
                              notification_channels: toggleArrayItem(
                                config.notification_channels,
                                channel
                              ),
                            })
                          }
                          disabled={isReadOnly}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            config.notification_channels.includes(channel)
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                          } disabled:cursor-not-allowed`}
                        >
                          {channel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="notify_status"
                        checked={config.notify_on_status_change}
                        onChange={(e) =>
                          updateConfig({
                            notify_on_status_change: e.target.checked,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="notify_status"
                        className="text-sm font-medium text-gray-900"
                      >
                        Notify on Status Change
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="notify_escalation"
                        checked={config.notify_on_escalation}
                        onChange={(e) =>
                          updateConfig({
                            notify_on_escalation: e.target.checked,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="notify_escalation"
                        className="text-sm font-medium text-gray-900"
                      >
                        Notify on Escalation
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="require_notes"
                        checked={config.require_closure_notes}
                        onChange={(e) =>
                          updateConfig({
                            require_closure_notes: e.target.checked,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="require_notes"
                        className="text-sm font-medium text-gray-900"
                      >
                        Require Closure Notes
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="enable_geofence"
                        checked={config.enable_geofencing_alerts}
                        onChange={(e) =>
                          updateConfig({
                            enable_geofencing_alerts: e.target.checked,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="enable_geofence"
                        className="text-sm font-medium text-gray-900"
                      >
                        Enable Geofencing Alerts
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auto Close False Alarm (seconds)
                      </label>
                      <input
                        type="number"
                        value={config.auto_close_false_alarm_seconds}
                        onChange={(e) =>
                          updateConfig({
                            auto_close_false_alarm_seconds:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>

                    {config.enable_geofencing_alerts && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Geofence Radius (meters)
                        </label>
                        <input
                          type="number"
                          value={config.geofence_radius_meters}
                          onChange={(e) =>
                            updateConfig({
                              geofence_radius_meters:
                                parseInt(e.target.value) || 0,
                            })
                          }
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Emergency Contacts
                      </h3>
                      {!isReadOnly && (
                        <button
                          onClick={addEmergencyContact}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Contact
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {config.emergency_contacts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
                          No emergency contacts added yet
                        </div>
                      ) : (
                        config.emergency_contacts.map((contact, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-md p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-medium text-gray-500">
                                Contact {index + 1}
                              </span>
                              {!isReadOnly && (
                                <button
                                  onClick={() => removeEmergencyContact(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={contact.name}
                                onChange={(e) =>
                                  updateEmergencyContact(index, {
                                    name: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Name"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                              <input
                                type="tel"
                                value={contact.phone}
                                onChange={(e) =>
                                  updateEmergencyContact(index, {
                                    phone: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                placeholder="Phone"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              />
                              <select
                                value={contact.service_type}
                                onChange={(e) =>
                                  updateEmergencyContact(index, {
                                    service_type: e.target.value,
                                  })
                                }
                                disabled={isReadOnly}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                              >
                                {SERVICE_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
