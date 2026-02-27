import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({ text, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    let top, left;

    switch (position) {
      case "top":
        top  = rect.top + window.scrollY - gap;
        left = rect.left + window.scrollX + rect.width / 2;
        break;
      case "bottom":
        top  = rect.bottom + window.scrollY + gap;
        left = rect.left + window.scrollX + rect.width / 2;
        break;
      case "left":
        top  = rect.top + window.scrollY + rect.height / 2;
        left = rect.left + window.scrollX - gap;
        break;
      case "right":
        top  = rect.top + window.scrollY + rect.height / 2;
        left = rect.right + window.scrollX + gap;
        break;
      default:
        top  = rect.top + window.scrollY - gap;
        left = rect.left + window.scrollX + rect.width / 2;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updateCoords();
    setShow(true);
  };

  const handleMouseLeave = () => setShow(false);

  // Transform based on position
  const transformMap = {
    top:    "translate(-50%, -100%)",
    bottom: "translate(-50%, 0%)",
    left:   "translate(-100%, -50%)",
    right:  "translate(0%, -50%)",
  };

  // Arrow position based on direction
  const arrowMap = {
    top:    "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800",
    left:   "absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800",
    right:  "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800",
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "contents" }}
      >
        {children}
      </div>

      {show && text && createPortal(
        <div
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            transform: transformMap[position],
            zIndex: 99999,
            pointerEvents: "none",
          }}
        >
          <div className="relative bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
            {text}
            <div className={arrowMap[position]} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;