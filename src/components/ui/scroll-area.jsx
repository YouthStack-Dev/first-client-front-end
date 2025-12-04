import React from "react";

export function ScrollArea({ className = "", children }) {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${className}`}
    >
      {children}
    </div>
  );
}
