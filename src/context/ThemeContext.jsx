// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme configurations
const THEMES = {
  blue: {
    name: 'Blue',
    prefix: 'sidebar',
    description: 'Professional blue theme'
  },
  dark: {
    name: 'Dark',
    prefix: 'dark',
    description: 'Modern dark theme'
  },
  green: {
    name: 'Green',
    prefix: 'green',
    description: 'Nature-inspired green theme'
  },
  purple: {
    name: 'Purple',
    prefix: 'purple',
    description: 'Creative purple theme'
  },
  orange: {
    name: 'Orange',
    prefix: 'orange',
    description: 'Energetic orange theme'
  },
  teal: {
    name: 'Teal',
    prefix: 'teal',
    description: 'Calm teal theme'
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue');
  
  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sidebar-theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sidebar-theme', currentTheme);
  }, [currentTheme]);
  
  const changeTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  const getThemeClasses = (classType) => {
    const prefix = THEMES[currentTheme].prefix;
    
    const classMap = {
      // Sidebar main classes
      sidebarBg: `from-${prefix}-primary-900 via-${prefix}-primary-800 to-${prefix}-primary-900`,
      headerBg: `bg-${prefix}-primary-800/50`,
      borderColor: `border-${prefix}-primary-200/30`,
      
      // Text colors
      textPrimary: 'text-white',
      textSecondary: `text-${prefix}-primary-100`,
      textMuted: `text-${prefix}-primary-200`,
      textHover: 'text-white',
      
      // Button states
      buttonActive: `bg-gradient-to-r from-${prefix}-primary-600 to-${prefix}-primary-400`,
      buttonHover: `hover:bg-${prefix}-primary-700/50`,
      buttonPinHover: `hover:bg-${prefix}-primary-700/50`,
      
      // Menu item states
      menuItemActive: `bg-gradient-to-r from-${prefix}-primary-600 to-${prefix}-primary-400`,
      menuItemHover: `hover:bg-${prefix}-primary-700/50`,
      subMenuItemActive: `bg-gradient-to-r from-${prefix}-accent-500 to-${prefix}-accent-600`,
      subMenuItemHover: `hover:bg-${prefix}-primary-700/50`,
      
      // Icon colors
      iconDefault: `text-${prefix}-primary-200`,
      iconActive: 'text-white',
      iconHover: 'group-hover:text-white',
      
      // Logout button
      logoutButton: `bg-gradient-to-r from-${prefix}-danger-600 to-${prefix}-danger-500 hover:from-${prefix}-danger-700 hover:to-${prefix}-danger-600`,
      
      // Skeleton loading
      skeletonBg: `bg-${prefix}-primary-100`,
      
      // Shadows
      shadowMain: 'shadow-sidebar',
      shadowItem: 'shadow-sidebar-item',
      shadowItemHover: 'shadow-sidebar-item-hover',
      
      // Scrollbar
      scrollbarThumb: `scrollbar-thumb-${prefix}-primary-200`
    };
    
    return classMap[classType] || '';
  };
  
  const value = {
    currentTheme,
    changeTheme,
    getThemeClasses,
    availableThemes: THEMES,
    themeConfig: THEMES[currentTheme]
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Switcher Component
export const ThemeSwitcher = ({ className = '' }) => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Sidebar Theme
      </label>
      <select
        value={currentTheme}
        onChange={(e) => changeTheme(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {Object.entries(availableThemes).map(([key, theme]) => (
          <option key={key} value={key}>
            {theme.name} - {theme.description}
          </option>
        ))}
      </select>
    </div>
  );
};
