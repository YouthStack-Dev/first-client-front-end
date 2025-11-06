export const getClusterColor = (clusterId) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16",
  ];
  const numericId =
    typeof clusterId === "string"
      ? parseInt(clusterId.replace(/\D/g, "")) || 0
      : clusterId;
  return colors[Math.abs(numericId) % colors.length];
};
