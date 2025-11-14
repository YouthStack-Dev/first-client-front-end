// components/Header.js
import React from "react";
import "./Header.css";

const Header = ({ onMenuClick }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h1 className="header-title">React Documentation</h1>
      </div>

      <div className="header-right">
        <span className="supademo-badge">Powered by Supademo</span>
      </div>
    </header>
  );
};

export default Header;
