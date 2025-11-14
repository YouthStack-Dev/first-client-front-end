// components/Sidebar.js
import React from "react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const demoSections = [
    {
      title: "Getting Started",
      items: [
        { id: "intro", name: "Introduction", demoId: "intro-demo" },
        { id: "installation", name: "Installation", demoId: "install-demo" },
        { id: "setup", name: "Setup Guide", demoId: "setup-demo" },
      ],
    },
    {
      title: "Components",
      items: [
        { id: "buttons", name: "Buttons", demoId: "buttons-demo" },
        { id: "forms", name: "Forms", demoId: "forms-demo" },
        { id: "navigation", name: "Navigation", demoId: "nav-demo" },
      ],
    },
    {
      title: "Advanced",
      items: [
        { id: "api", name: "API Integration", demoId: "api-demo" },
        { id: "state", name: "State Management", demoId: "state-demo" },
        { id: "performance", name: "Performance", demoId: "perf-demo" },
      ],
    },
  ];

  const handleDemoClick = (demoId) => {
    // This will be handled by the main content area
    console.log("Demo selected:", demoId);
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>React Documentation</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {demoSections.map((section, index) => (
            <div key={index} className="sidebar-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-list">
                {section.items.map((item) => (
                  <li key={item.id} className="nav-item">
                    <button
                      className="nav-link"
                      onClick={() => handleDemoClick(item.demoId)}
                    >
                      {item.name}
                      <span className="demo-badge">Demo</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
