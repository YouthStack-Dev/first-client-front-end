import React, { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Layers,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

/**
 * Kebab-menu actions dropdown.
 *
 * Props:
 *  - options: Array<{
 *      label: string,
 *      onClick: () => void,
 *      danger?: boolean,
 *      icon?: React.ComponentType, // optional explicit icon override
 *    }>
 */

// Fallback icon mapping based on label text (case-insensitive)
const getIconForLabel = (label = "") => {
  const l = label.toLowerCase();
  if (l.includes("edit")) return Pencil;
  if (l.includes("slab")) return Layers;
  if (l.includes("activate") && !l.includes("deactivate")) return Power;
  if (l.includes("deactivate")) return PowerOff;
  if (l.includes("delete")) return Trash2;
  return null;
};

const ActionsDropdown = ({ options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 ${
          open ? "bg-gray-100 text-gray-700" : ""
        }`}
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-1.5 w-48 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          <ul className="py-1">
            {options.map((opt, idx) => {
              const Icon = opt.icon || getIconForLabel(opt.label);
              const isDanger = !!opt.danger;

              // Insert a divider before the first danger item
              const prevIsDanger = idx > 0 ? !!options[idx - 1].danger : false;
              const showDivider = isDanger && !prevIsDanger && idx > 0;

              return (
                <React.Fragment key={idx}>
                  {showDivider && (
                    <li role="separator" className="my-1 border-t border-gray-100" />
                  )}
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false);
                        opt.onClick();
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                        isDanger
                          ? "text-red-600 hover:bg-red-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          size={15}
                          className={isDanger ? "text-red-500" : "text-gray-400"}
                        />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;