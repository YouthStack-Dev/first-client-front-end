import { BarChart3, Download } from "lucide-react";

export const ReportCard = ({
  title,
  icon: Icon,
  description,
  onAnalytics,
  onDownload,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            <p className="text-sm text-white/90 truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer with compact icon buttons */}
      <div className="p-3 bg-gray-50/50">
        <div className="flex justify-between items-center">
          <button
            onClick={onAnalytics}
            className={`flex items-center justify-center p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group ${iconColorClasses[color]}`}
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={onDownload}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group text-emerald-600"
            title="Download Excel"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
