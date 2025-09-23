import { Plus } from "lucide-react";

export default function AddButton({ onClick, tooltip = "Add" }) {
  if (!onClick) return null;

  return (
    <div className="flex gap-2">
      <div className="relative group">
        {/* Tooltip */}
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 
                     bg-gray-800 text-white text-xs px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition 
                     whitespace-nowrap z-[9999] pointer-events-none shadow-lg"
        >
          {tooltip}
        </span>

        {/* Button */}
        <button
          onClick={onClick}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center relative z-[1]"
          aria-label={tooltip}
          type="button"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
