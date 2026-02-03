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
    <div className="bg-app-surface rounded-lg shadow-lg p-6 mb-4 border border-app-border hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-app-text-primary">
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
                  ? "bg-sidebar-tertiary text-sidebar-primary"
                  : "bg-app-tertiary text-app-primary"
              }`}
            >
              {config.team_id === null ? "Tenant" : "Team"}
            </span>
          </div>
          <p className="text-app-text-secondary text-sm mb-3">
            {config.description}
          </p>
          <div className="text-sm text-app-text-muted">
            <span className="font-medium text-app-text-secondary">Scope: </span>
            {getScope()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-app-text-secondary">
            Priority:{" "}
            <span className="text-app-primary font-semibold">
              {config.priority}
            </span>
          </div>
          <div className="text-xs text-app-text-muted mt-1">
            ID: {config.config_id}
          </div>
        </div>
      </div>

      {/* Main Configuration Details - Horizontal Layout */}
      <div className="border-t border-b border-app-border py-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Alert Types Section */}
          <div>
            <h4 className="text-sm font-medium text-app-text-secondary mb-2">
              Alert Types
            </h4>
            <div className="space-y-1">
              {alertTypes.visible.map((type, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-app-primary rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-app-text-primary">
                    {type}
                  </span>
                </div>
              ))}
              {alertTypes.hiddenCount > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-app-border rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-app-text-muted">
                    +{alertTypes.hiddenCount} more
                  </span>
                </div>
              )}
              {alertTypes.visible.length === 0 && (
                <div className="text-sm text-app-text-muted italic">None</div>
              )}
            </div>
          </div>

          {/* Channels Section */}
          <div>
            <h4 className="text-sm font-medium text-app-text-secondary mb-2">
              Channels
            </h4>
            <div className="space-y-1">
              {channels.visible.map((channel, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-app-secondary rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-app-text-primary">
                    {channel}
                  </span>
                </div>
              ))}
              {channels.hiddenCount > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-app-border rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-app-text-muted">
                    +{channels.hiddenCount} more
                  </span>
                </div>
              )}
              {channels.visible.length === 0 && (
                <div className="text-sm text-app-text-muted italic">None</div>
              )}
            </div>
          </div>

          {/* Escalation Section */}
          <div>
            <h4 className="text-sm font-medium text-app-text-secondary mb-2">
              Escalation
            </h4>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  config.enable_escalation
                    ? "bg-sidebar-primary"
                    : "bg-app-border"
                }`}
              ></div>
              <span className="text-sm font-medium text-app-text-primary">
                {config.enable_escalation
                  ? `${config.escalation_threshold_seconds}s`
                  : "Disabled"}
              </span>
            </div>
            {config.enable_escalation && (
              <div className="mt-2 text-xs text-app-text-muted">
                Auto-escalates after {config.escalation_threshold_seconds}s
              </div>
            )}
          </div>

          {/* Recipients Section */}
          <div>
            <h4 className="text-sm font-medium text-app-text-secondary mb-2">
              Recipients
            </h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-sidebar-secondary rounded-full mr-2"></div>
                <div>
                  <span className="text-sm font-medium text-app-text-primary">
                    {config.primary_recipients.length} primary
                  </span>
                  <div className="text-xs text-app-text-muted">
                    {primaryRecipients.visible.length > 0 ? (
                      <>
                        {primaryRecipients.visible[0].name}
                        {primaryRecipients.hiddenCount > 0 && (
                          <span className="ml-1 text-app-text-muted">
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
                  <div className="w-2 h-2 bg-app-primary rounded-full mr-2"></div>
                  <div>
                    <span className="text-sm font-medium text-app-text-primary">
                      {config.escalation_recipients.length} escalation
                    </span>
                    <div className="text-xs text-app-text-muted">
                      {escalationRecipients.visible.length > 0 ? (
                        <>
                          {escalationRecipients.visible[0].name}
                          {escalationRecipients.hiddenCount > 0 && (
                            <span className="ml-1 text-app-text-muted">
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
          <h4 className="text-sm font-medium text-app-text-secondary mb-2">
            Emergency Contacts
          </h4>
          <div className="flex flex-wrap gap-2">
            {emergencyContacts.visible.map((contact, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-sidebar-tertiary text-sidebar-primary text-xs rounded-full border border-sidebar-secondary"
              >
                {contact.name} ({contact.service_type})
              </span>
            ))}
            {emergencyContacts.hiddenCount > 0 && (
              <span className="px-2 py-1 bg-app-tertiary text-app-text-muted text-xs rounded-full">
                +{emergencyContacts.hiddenCount} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Features Section - Compact Version */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-app-text-secondary mb-2">
          Features
        </h4>
        <div className="flex flex-wrap gap-1">
          {config.enable_geofencing_alerts && (
            <span className="px-2 py-1 bg-app-tertiary text-app-primary text-xs rounded border border-app-secondary">
              📍 {config.geofence_radius_meters}m
            </span>
          )}
          {config.notify_on_status_change && (
            <span className="px-2 py-1 bg-app-tertiary text-app-primary text-xs rounded border border-app-secondary">
              🔄 Status Updates
            </span>
          )}
          {config.require_closure_notes && (
            <span className="px-2 py-1 bg-sidebar-tertiary text-sidebar-primary text-xs rounded border border-sidebar-secondary">
              📝 Closure Notes
            </span>
          )}
          {config.auto_close_false_alarm_seconds > 0 && (
            <span className="px-2 py-1 bg-app-tertiary text-app-primary text-xs rounded border border-app-secondary">
              ⏱️ {config.auto_close_false_alarm_seconds}s
            </span>
          )}
          {config.notify_on_escalation && (
            <span className="px-2 py-1 bg-app-tertiary text-app-primary text-xs rounded border border-app-secondary">
              ⚡ Escalation Alerts
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-app-border">
        <div className="text-sm text-app-text-muted">
          <span className="font-medium text-app-text-secondary">Created:</span>{" "}
          {config.created_at ? formatDate(config.created_at) : "N/A"}
        </div>
        <div className="flex gap-2">
          <ReusableButton
            module={"alert"}
            action="read"
            buttonName="View Details"
            title="View Details"
            onClick={() => onViewClick(config)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-sidebar-primary text-white rounded hover:bg-sidebar-secondary transition-all duration-300 shadow-md hover:shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AlertConfigCard;
