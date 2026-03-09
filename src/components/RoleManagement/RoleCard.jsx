import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Shield,
  Calendar,
  RefreshCw,
  Users,
  Key,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/Card";

function RoleCard({ role, onEdit, onDelete, onView, variant = "default", isSuperAdmin = false }) {
  // Format date for display - handle API date format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const isoString = dateString.split(".")[0] + "Z";
      const fallbackDate = new Date(isoString);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toLocaleDateString();
      }
      return "N/A";
    }
    return date.toLocaleDateString();
  };

  // Define color variants
  const variants = {
    default: {
      accent: "from-sidebar-primary to-sidebar-secondary",
      icon: "text-sidebar-primary",
      badge: "bg-sidebar-tertiary text-sidebar-primary",
      text: "text-sidebar-primary",
    },
    admin: {
      accent: "from-blue-500 to-blue-600",
      icon: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
      text: "text-blue-900",
    },
    manager: {
      accent: "from-green-500 to-green-600",
      icon: "text-green-600",
      badge: "bg-green-100 text-green-800",
      text: "text-green-900",
    },
    support: {
      accent: "from-purple-500 to-purple-600",
      icon: "text-purple-600",
      badge: "bg-purple-100 text-purple-800",
      text: "text-purple-900",
    },
    system: {
      accent: "from-orange-500 to-orange-600",
      icon: "text-orange-600",
      badge: "bg-orange-100 text-orange-800",
      text: "text-orange-900",
    },
  };

  // Determine variant based on role name if not specified
  const getRoleVariant = () => {
    if (variant !== "default") return variant;

    const roleName = role.name?.toLowerCase() || "";
    if (roleName.includes("admin")) return "admin";
    if (roleName.includes("manager")) return "manager";
    if (roleName.includes("support")) return "support";
    if (role.is_system_role) return "system";
    return "default";
  };

  const roleVariant = getRoleVariant();
  const variantStyles = variants[roleVariant];

  // Determine card background based on variant
  const getCardBackground = () => {
    switch (roleVariant) {
      case "admin":
        return "bg-gradient-to-br from-app-surface to-blue-50/50";
      case "manager":
        return "bg-gradient-to-br from-app-surface to-green-50/50";
      case "support":
        return "bg-gradient-to-br from-app-surface to-purple-50/50";
      case "system":
        return "bg-gradient-to-br from-app-surface to-orange-50/50";
      default:
        return "bg-app-surface";
    }
  };

  // ── Show edit/delete if:
  //    - Not a system role (anyone can edit tenant roles)
  //    - OR SuperAdmin (can edit system roles too)
  const canEdit = !role.is_system_role || isSuperAdmin;

  return (
    <Card className={`h-full ${getCardBackground()}`}>
      <CardHeader className="pb-4">
        {/* Colored accent bar */}
        <div
          className={`h-1 w-16 rounded-full bg-gradient-to-r ${variantStyles.accent} mb-2`}
        ></div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={`text-lg ${variantStyles.text}`}>
                {role.name}
              </CardTitle>
              {role.is_system_role && (
                <Shield className={`w-4 h-4 ${variantStyles.icon}`} />
              )}
            </div>

            <CardDescription className="mb-4">
              {role.description || "No description provided"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Role Metadata */}
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <Calendar className="w-3 h-3 mr-1.5 text-app-text-muted" />
            <span className="font-medium text-app-text-secondary">
              Created:
            </span>
            <span className="ml-1 text-app-text-muted">
              {formatDate(role.created_at)}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <RefreshCw className="w-3 h-3 mr-1.5 text-app-text-muted" />
            <span className="font-medium text-app-text-secondary">
              Updated:
            </span>
            <span className="ml-1 text-app-text-muted">
              {formatDate(role.updated_at)}
            </span>
          </div>

          {/* Role type badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {role.is_system_role && (
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${variantStyles.badge}`}
              >
                System Role
              </span>
            )}

            {role.is_default && (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                Default Role
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          {/* Stats */}
          <div className="flex items-center space-x-4">
            {role.permissions_count !== undefined && (
              <div className="flex items-center">
                <Key className="w-3 h-3 mr-1.5 text-app-text-muted" />
                <div className="flex flex-col">
                  <span className="text-xs text-app-text-secondary">
                    Permissions
                  </span>
                  <span
                    className={`text-sm font-semibold ${variantStyles.text}`}
                  >
                    {role.permissions_count}
                  </span>
                </div>
              </div>
            )}

            {role.user_count !== undefined && (
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1.5 text-app-text-muted" />
                <div className="flex flex-col">
                  <span className="text-xs text-app-text-secondary">Users</span>
                  <span
                    className={`text-sm font-semibold ${variantStyles.text}`}
                  >
                    {role.user_count}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* View Button - always visible */}
            <ReusableButton
              module="role"
              action="read"
              buttonName=""
              icon={Eye}
              title="View details"
              onClick={() => onView(role)}
              className={`flex items-center justify-center p-2 rounded-md bg-app-tertiary text-sidebar-primary hover:bg-gradient-to-r ${variantStyles.accent} hover:text-white transition-all duration-300`}
            />

            {/* Edit Button - visible for non-system roles OR SuperAdmin */}
            {canEdit && onEdit && (
              <ReusableButton
                module="role"
                action="update"
                buttonName=""
                icon={Edit}
                title={role.is_system_role ? "Edit system role" : "Edit role"}
                onClick={() => onEdit(role)}
                className={`flex items-center justify-center p-2 rounded-md bg-app-tertiary text-sidebar-primary hover:bg-gradient-to-r ${variantStyles.accent} hover:text-white transition-all duration-300`}
              />
            )}

            {/* Delete Button - visible for non-system roles OR SuperAdmin */}
            {canEdit && onDelete && (
              <ReusableButton
                module="role"
                action="delete"
                buttonName=""
                icon={Trash2}
                title={role.is_system_role ? "Delete system role" : "Delete role"}
                onClick={() => onDelete(role)}
                className="flex items-center justify-center p-2 rounded-md bg-app-tertiary text-sidebar-primary hover:bg-gradient-to-r from-red-500 to-red-600 hover:text-white transition-all duration-300"
              />
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default RoleCard;