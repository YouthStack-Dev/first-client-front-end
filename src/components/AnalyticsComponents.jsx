import { colorConfig } from "../utils/analyticsConfig";

// StatCard Component
export const StatCard = ({ label, value, icon: Icon, color = "blue" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`bg-gradient-to-r ${colorConfig.statCard[color]} p-3 rounded-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// ProgressBar Component
export const ProgressBar = ({ label, value, max, color = "blue" }) => {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.min((value / safeMax) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-800">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorConfig.progressBar[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// StatusBreakdown Component
export const StatusBreakdown = ({ title, data, colors = {} }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No status data available</p>
        </div>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const defaultColors = colorConfig.statusIndicator;
  const colorKeys = Object.keys(defaultColors);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([status, count], index) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          const color =
            colors[status] ||
            defaultColors[colorKeys[index % colorKeys.length]];

          return (
            <div
              key={status}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{percentage}%</span>
                <span className="text-lg font-bold text-gray-800">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SummarySection Component
export const SummarySection = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
};
