// components/AlertConfigCard.js
import React from "react";
import { STATIC_TEAMS } from "../modals/alertConfig";
import ReusableButton from "../ui/ReusableButton";

const AlertConfigCard = ({ config, onViewClick }) => {
  const getScope = () => {
    if (config.team_id === null) {
      return "Tenant Level (All Teams)";
    }
    const team = STATIC_TEAMS.find((t) => t.id === config.team_id);
    return `Team Level: ${team ? team.name : `Team ${config.team_id}`}`;
  };

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Function to limit items and show "more" indicator
  const getLimitedItems = (items, limit = 2) => {
    if (!items || items.length === 0) return { visible: [], hiddenCount: 0 };
    const visible = items.slice(0, limit);
    const hiddenCount = items.length - limit;
    return { visible, hiddenCount };
  };

  // Get limited items for display
  const alertTypes = getLimitedItems(config.applicable_alert_types);
  const channels = getLimitedItems(config.notification_channels);
  const primaryRecipients = getLimitedItems(config.primary_recipients);
  const escalationRecipients = getLimitedItems(config.escalation_recipients);
  const emergencyContacts = getLimitedItems(config.emergency_contacts);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {config.config_name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                config.is_active || true
              )}`}
            >
              {config.is_active ? "Active" : "Inactive"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                config.team_id === null
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {config.team_id === null ? "Tenant" : "Team"}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{config.description}</p>
          <div className="text-sm text-gray-500">
            <span className="font-medium">Scope: </span>
            {getScope()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-500">
            Priority: <span className="text-blue-600">{config.priority}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ID: {config.config_id}
          </div>
        </div>
      </div>

      {/* Main Configuration Details - Horizontal Layout */}
      <div className="border-t border-b border-gray-100 py-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Alert Types Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Alert Types
            </h4>
            <div className="space-y-1">
              {alertTypes.visible.map((type, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {type}
                  </span>
                </div>
              ))}
              {alertTypes.hiddenCount > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-500">
                    +{alertTypes.hiddenCount} more
                  </span>
                </div>
              )}
              {alertTypes.visible.length === 0 && (
                <div className="text-sm text-gray-400 italic">None</div>
              )}
            </div>
          </div>

          {/* Channels Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Channels</h4>
            <div className="space-y-1">
              {channels.visible.map((channel, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {channel}
                  </span>
                </div>
              ))}
              {channels.hiddenCount > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-500">
                    +{channels.hiddenCount} more
                  </span>
                </div>
              )}
              {channels.visible.length === 0 && (
                <div className="text-sm text-gray-400 italic">None</div>
              )}
            </div>
          </div>

          {/* Escalation Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Escalation
            </h4>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  config.enable_escalation ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {config.enable_escalation
                  ? `${config.escalation_threshold_seconds}s`
                  : "Disabled"}
              </span>
            </div>
            {config.enable_escalation && (
              <div className="mt-2 text-xs text-gray-500">
                Auto-escalates after {config.escalation_threshold_seconds}s
              </div>
            )}
          </div>

          {/* Recipients Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Recipients
            </h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {config.primary_recipients.length} primary
                  </span>
                  <div className="text-xs text-gray-500">
                    {primaryRecipients.visible.length > 0 ? (
                      <>
                        {primaryRecipients.visible[0].name}
                        {primaryRecipients.hiddenCount > 0 && (
                          <span className="ml-1 text-gray-400">
                            +{primaryRecipients.hiddenCount}
                          </span>
                        )}
                      </>
                    ) : (
                      "No primary recipients"
                    )}
                  </div>
                </div>
              </div>
              {config.enable_escalation && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {config.escalation_recipients.length} escalation
                    </span>
                    <div className="text-xs text-gray-500">
                      {escalationRecipients.visible.length > 0 ? (
                        <>
                          {escalationRecipients.visible[0].name}
                          {escalationRecipients.hiddenCount > 0 && (
                            <span className="ml-1 text-gray-400">
                              +{escalationRecipients.hiddenCount}
                            </span>
                          )}
                        </>
                      ) : (
                        "No escalation recipients"
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts (if any) */}
      {config.emergency_contacts && config.emergency_contacts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Emergency Contacts
          </h4>
          <div className="flex flex-wrap gap-2">
            {emergencyContacts.visible.map((contact, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full"
              >
                {contact.name} ({contact.service_type})
              </span>
            ))}
            {emergencyContacts.hiddenCount > 0 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{emergencyContacts.hiddenCount} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Features Section - Compact Version */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
        <div className="flex flex-wrap gap-1">
          {config.enable_geofencing_alerts && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              📍 {config.geofence_radius_meters}m
            </span>
          )}
          {config.notify_on_status_change && (
            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
              🔄 Updates
            </span>
          )}
          {config.require_closure_notes && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
              📝 Notes
            </span>
          )}
          {config.auto_close_false_alarm_seconds > 0 && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">
              ⏱️ {config.auto_close_false_alarm_seconds}s
            </span>
          )}
          {config.notify_on_escalation && (
            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
              ⚡ Escalate
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Created:</span>{" "}
          {config.created_at ? formatDate(config.created_at) : "N/A"}
        </div>
        <div className="flex gap-2">
          <ReusableButton
            module={"alert"}
            action="read"
            buttonName="View Details"
            title="View Details"
            onClick={() => onViewClick(config)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          />
        </div>
      </div>
    </div>
  );
};

export default AlertConfigCard;
