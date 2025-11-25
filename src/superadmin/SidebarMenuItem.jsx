import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const SidebarMenuItem = ({ item, isOpen, openDropdown, toggleDropdown }) => {
  const location = useLocation();

  const isActive = location.pathname === item.path;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isDropdownOpen = openDropdown[item.name];

  if (hasSubItems) {
    return (
      <div className="relative">
        <button
          onClick={() => toggleDropdown(item.name)}
          className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
            isDropdownOpen
              ? "bg-sidebar-primary-700 text-white shadow-sidebar-item"
              : "text-sidebar-primary-200 hover:bg-sidebar-primary-700 hover:text-white hover:shadow-sidebar-item-hover"
          }`}
        >
          <item.icon className="w-5 h-5 min-w-[1.25rem]" />
          {isOpen && (
            <>
              <span className="ml-3 flex-1 text-left">{item.name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {isOpen && isDropdownOpen && (
          <div className="mt-2 space-y-1 pl-4 border-l-2 border-sidebar-primary-600 ml-2">
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  location.pathname === subItem.path
                    ? "bg-sidebar-accent-600 text-white shadow-md"
                    : "text-sidebar-primary-300 hover:bg-sidebar-primary-600 hover:text-white"
                }`}
              >
                <subItem.icon className="w-4 h-4" />
                <span className="ml-2">{subItem.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center px-4 py-3.5 rounded-xl transition-colors text-sm font-medium ${
        isActive
          ? "bg-sidebar-primary-700 text-white shadow-sidebar-item"
          : "text-sidebar-primary-200 hover:bg-sidebar-primary-700 hover:text-white hover:shadow-sidebar-item-hover"
      }`}
    >
      <item.icon className="w-5 h-5 min-w-[1.25rem]" />
      {isOpen && <span className="ml-3">{item.name}</span>}
    </Link>
  );
};

export default React.memo(SidebarMenuItem);
