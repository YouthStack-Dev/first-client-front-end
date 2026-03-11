import { CHIP_COLORS, FEMALE_CHIP_COLOR } from "./routeCardConstants";


export const getChipColor = (code = "", isFemale = false) => {
  if (isFemale) return FEMALE_CHIP_COLOR;
  const sum = code.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CHIP_COLORS[sum % CHIP_COLORS.length];
};

/**
 * Derives 2-character initials from an employee code.
 * e.g. "EMP301" → "E1", "ACC_001" → "A1", "XY" → "XY"
 */
export const getCodeInitials = (code = "") => {
  const letters = code.replace(/\d/g, "");
  const digits  = code.replace(/\D/g, "");
  if (letters && digits) return (letters[0] + digits.slice(-1)).toUpperCase();
  return code.slice(0, 2).toUpperCase();
};

/**
 * Trims a full address to the first segment (before the first comma).
 * e.g. "Koramangala 4th Block, Bangalore" → "Koramangala 4th Block"
 */
export const shortLocation = (loc = "") => loc.split(",")[0].trim();

/**
 * Safely renders any route field value.
 * Handles null, undefined, objects with a .name field, and plain values.
 */
export const renderSafeValue = (value, fallback = "N/A") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value.name ?? JSON.stringify(value);
  return value;
};

/**
 * Returns Tailwind color classes + icon NAME for a given route status.
 * The actual icon component is rendered in SavedRouteCard — keeps this file JSX-free.
 *
 * iconName matches lucide-react export names:
 *   "Clock" | "PlayCircle" | "CheckCircle2" | "AlertCircle" | "User"
 */
export const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "planned":
      return { color: "bg-indigo-50 text-indigo-700 border-indigo-200",  iconName: "Clock"        };
    case "ongoing":
      return { color: "bg-blue-100 text-blue-700 border-blue-200",        iconName: "PlayCircle"   };
    case "completed":
      return { color: "bg-green-100 text-green-700 border-green-200",     iconName: "CheckCircle2" };
    case "cancelled":
      return { color: "bg-red-100 text-red-700 border-red-200",           iconName: "AlertCircle"  };
    case "driver assigned":
      return { color: "bg-orange-50 text-orange-700 border-orange-200",   iconName: "User"         };
    default:
      return { color: "bg-gray-100 text-gray-600 border-gray-200",        iconName: "AlertCircle"  };
  }
};

/**
 * Returns true if the given gender string represents female.
 */
export const isFemaleGender = (gender = "") => gender?.toLowerCase() === "female";