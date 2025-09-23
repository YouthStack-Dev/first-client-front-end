import { Upload } from "lucide-react";

export default function BulkUploadButton({ onBulkUpload }) {
  return (
    <div className="flex gap-2">
      {onBulkUpload && (
        <div className="relative group">
          {/* Tooltip */}
          <span
            className="absolute -top-8 left-1/2 -translate-x-1/2 
                       bg-gray-800 text-white text-xs px-2 py-1 rounded 
                       opacity-0 group-hover:opacity-100 transition 
                       whitespace-nowrap z-[9999] pointer-events-none shadow-lg"
          >
            Bulk Upload
          </span>

          {/* Button */}
          <button
            onClick={onBulkUpload}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center relative z-[1]"
          >
            <Upload size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
