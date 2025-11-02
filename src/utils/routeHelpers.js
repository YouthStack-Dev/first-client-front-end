// Helper function to calculate distance between two points
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate total distance for a route sequence
export const calculateRouteDistance = (route) => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
};

// Find optimal route sequence using multiple algorithms
export const findOptimalRouteSequence = (
  pickupPoints,
  destination,
  algorithm = "nearest-neighbor"
) => {
  if (pickupPoints.length === 0) return [];

  switch (algorithm) {
    case "nearest-neighbor":
      return nearestNeighborAlgorithm(pickupPoints, destination);
    case "christofides":
      return christofidesAlgorithm(pickupPoints, destination);
    case "brute-force":
      return bruteForceAlgorithm(pickupPoints, destination);
    default:
      return nearestNeighborAlgorithm(pickupPoints, destination);
  }
};

// Nearest Neighbor Algorithm (Fast, good for real-time)
const nearestNeighborAlgorithm = (pickupPoints, destination) => {
  const points = [...pickupPoints];
  const sequence = [];

  // Start from the point closest to destination
  let currentPoint = destination;

  // Find the starting point (closest to destination)
  let startIndex = 0;
  let minDistance = calculateDistance(destination, points[0]);

  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance(destination, points[i]);
    if (distance < minDistance) {
      minDistance = distance;
      startIndex = i;
    }
  }

  currentPoint = points[startIndex];
  sequence.push(currentPoint);
  points.splice(startIndex, 1);

  while (points.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentPoint, points[0]);

    for (let i = 1; i < points.length; i++) {
      const distance = calculateDistance(currentPoint, points[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    sequence.push(points[nearestIndex]);
    currentPoint = points[nearestIndex];
    points.splice(nearestIndex, 1);
  }

  return sequence;
};

// Christofides Algorithm (Better approximation for TSP)
const christofidesAlgorithm = (pickupPoints, destination) => {
  if (pickupPoints.length <= 2) {
    return nearestNeighborAlgorithm(pickupPoints, destination);
  }

  // For smaller sets, use optimized nearest neighbor
  const allPoints = [...pickupPoints, destination];
  const distanceMatrix = createDistanceMatrix(allPoints);

  // Find minimum spanning tree and create Eulerian tour
  const mst = primMST(distanceMatrix, allPoints.length);
  const eulerianTour = findEulerianTour(mst, allPoints.length);

  // Remove duplicates using Hamiltonian path
  const hamiltonianPath = [];
  const visited = new Set();

  for (const point of eulerianTour) {
    if (!visited.has(point)) {
      hamiltonianPath.push(point);
      visited.add(point);
    }
  }

  // Convert back to points and remove destination from sequence
  const sequence = hamiltonianPath
    .map((index) => allPoints[index])
    .filter((point) => point !== destination);

  return sequence.length === pickupPoints.length
    ? sequence
    : nearestNeighborAlgorithm(pickupPoints, destination);
};

// Brute Force Algorithm (Optimal but slow - for small sets only)
const bruteForceAlgorithm = (pickupPoints, destination) => {
  if (pickupPoints.length > 8) {
    console.warn(
      "Brute force algorithm is too slow for more than 8 points. Using nearest neighbor instead."
    );
    return nearestNeighborAlgorithm(pickupPoints, destination);
  }

  const allPoints = [...pickupPoints];
  let bestSequence = [...allPoints];
  let bestDistance = calculateRouteDistance([...allPoints, destination]);

  // Generate all permutations
  const permutations = generatePermutations(allPoints);

  for (const permutation of permutations) {
    const currentDistance = calculateRouteDistance([
      ...permutation,
      destination,
    ]);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestSequence = [...permutation];
    }
  }

  return bestSequence;
};

// Helper function to create distance matrix
const createDistanceMatrix = (points) => {
  const n = points.length;
  const matrix = Array(n)
    .fill()
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        matrix[i][j] = calculateDistance(points[i], points[j]);
      }
    }
  }

  return matrix;
};

// Prim's algorithm for Minimum Spanning Tree
const primMST = (distanceMatrix, n) => {
  const parent = Array(n).fill(-1);
  const key = Array(n).fill(Infinity);
  const mstSet = Array(n).fill(false);

  key[0] = 0;
  parent[0] = -1;

  for (let count = 0; count < n - 1; count++) {
    const u = minKey(key, mstSet, n);
    mstSet[u] = true;

    for (let v = 0; v < n; v++) {
      if (distanceMatrix[u][v] && !mstSet[v] && distanceMatrix[u][v] < key[v]) {
        parent[v] = u;
        key[v] = distanceMatrix[u][v];
      }
    }
  }

  return parent;
};

// Find minimum key value
const minKey = (key, mstSet, n) => {
  let min = Infinity;
  let minIndex = -1;

  for (let v = 0; v < n; v++) {
    if (!mstSet[v] && key[v] < min) {
      min = key[v];
      minIndex = v;
    }
  }

  return minIndex;
};

// Find Eulerian tour from MST
const findEulerianTour = (parent, n) => {
  const tour = [];
  const dfs = (node) => {
    tour.push(node);
    for (let i = 0; i < n; i++) {
      if (parent[i] === node) {
        dfs(i);
        tour.push(node);
      }
    }
  };

  dfs(0);
  return tour;
};

// Generate all permutations for brute force
const generatePermutations = (arr) => {
  if (arr.length <= 1) return [arr];

  const permutations = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = generatePermutations(remaining);

    for (const perm of remainingPerms) {
      permutations.push([current, ...perm]);
    }
  }

  return permutations;
};

// Optimize merged route with multiple algorithm options
export const optimizeMergedRoute = (
  pickupPoints,
  destination,
  options = {}
) => {
  const {
    algorithm = "nearest-neighbor",
    maxPointsForExact = 8,
    timeLimit = 5000, // 5 seconds timeout
  } = options;

  const startTime = Date.now();

  // Choose algorithm based on number of points
  let selectedAlgorithm = algorithm;
  if (pickupPoints.length <= maxPointsForExact && algorithm !== "brute-force") {
    selectedAlgorithm = "brute-force";
  } else if (pickupPoints.length > 15) {
    selectedAlgorithm = "nearest-neighbor"; // Fastest for large sets
  }

  try {
    const optimalSequence = findOptimalRouteSequence(
      pickupPoints,
      destination,
      selectedAlgorithm
    );
    const executionTime = Date.now() - startTime;

    return {
      sequence: optimalSequence,
      algorithm: selectedAlgorithm,
      distance: calculateRouteDistance([...optimalSequence, destination]),
      executionTime,
      pointsCount: pickupPoints.length,
    };
  } catch (error) {
    console.warn(
      "Optimization failed, falling back to nearest neighbor:",
      error
    );
    // Fallback to nearest neighbor
    return {
      sequence: nearestNeighborAlgorithm(pickupPoints, destination),
      algorithm: "nearest-neighbor-fallback",
      distance: calculateRouteDistance([...pickupPoints, destination]),
      executionTime: Date.now() - startTime,
      pointsCount: pickupPoints.length,
      error: error.message,
    };
  }
};

// Calculate route efficiency for merging decisions
export const calculateRouteEfficiency = (clusters, commonDestination) => {
  if (!clusters || !commonDestination) return null;

  let totalIndividualDistance = 0;
  const allPickupPoints = [];
  const clusterDistances = [];

  // Calculate individual cluster distances
  clusters.forEach((cluster) => {
    const pickupPoints = cluster.bookings.map((booking) => ({
      lat: booking.pickup_latitude,
      lng: booking.pickup_longitude,
      bookingId: booking.booking_id,
      employeeCode: booking.employee_code,
    }));

    const optimalSequence = findOptimalRouteSequence(
      pickupPoints,
      commonDestination
    );
    const clusterDistance = calculateRouteDistance([
      ...optimalSequence,
      commonDestination,
    ]);

    totalIndividualDistance += clusterDistance;
    allPickupPoints.push(...pickupPoints);
    clusterDistances.push({
      clusterId: cluster.cluster_id,
      distance: clusterDistance,
      bookings: cluster.bookings.length,
    });
  });

  // Calculate merged distance
  const mergedOptimization = optimizeMergedRoute(
    allPickupPoints,
    commonDestination
  );
  const mergedDistance = mergedOptimization.distance;

  const efficiencyImprovement = totalIndividualDistance - mergedDistance;
  const improvementPercentage =
    totalIndividualDistance > 0
      ? (efficiencyImprovement / totalIndividualDistance) * 100
      : 0;

  return {
    totalIndividualDistance,
    mergedDistance,
    efficiencyImprovement,
    improvementPercentage: Number(improvementPercentage.toFixed(1)),
    clusterDistances,
    optimizationResult: mergedOptimization,
    shouldMerge: improvementPercentage > 10, // Only recommend merge if improvement > 10%
  };
};

// Get the best algorithm for given number of points
export const getRecommendedAlgorithm = (pointCount) => {
  if (pointCount <= 8) return "brute-force";
  if (pointCount <= 15) return "christofides";
  return "nearest-neighbor";
};

export const getClusterColor = (clusterId) => {
  // Handle string cluster IDs like "merged-123456789"
  if (typeof clusterId === "string" && clusterId.startsWith("merged-")) {
    return "#8B5CF6"; // Purple for merged clusters
  }

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
    "#06B6D4",
    "#F43F5E",
    "#A855F7",
    "#EAB308",
    "#22C55E",
  ];

  // Extract numeric part from cluster ID for consistent coloring
  const numericId =
    typeof clusterId === "string"
      ? parseInt(clusterId.replace(/\D/g, "")) || 0
      : clusterId;

  return colors[Math.abs(numericId) % colors.length];
};

export const getWidthSettings = (routeWidth) => {
  switch (routeWidth) {
    case "thin":
      return { optimized: 4, normal: 3, merged: 6 };
    case "medium":
      return { optimized: 8, normal: 6, merged: 10 };
    case "thick":
      return { optimized: 12, normal: 8, merged: 14 };
    case "very-thick":
      return { optimized: 16, normal: 12, merged: 18 };
    default:
      return { optimized: 8, normal: 6, merged: 10 };
  }
};

// Helper function to check if data is empty
export const isEmptyData = (data) => {
  if (!data) return true;

  // Check for empty clusters array
  if (data.route_clusters && Array.isArray(data.route_clusters)) {
    return data.route_clusters.length === 0;
  }

  // Check for empty shifts array (from your API response example)
  if (data.shifts && Array.isArray(data.shifts)) {
    return data.shifts.length === 0;
  }

  // Check for empty data object
  if (Object.keys(data).length === 0) {
    return true;
  }

  return false;
};

// Format distance for display
export const formatDistance = (distanceInKm) => {
  if (distanceInKm < 1) {
    return `${(distanceInKm * 1000).toFixed(0)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

// Calculate center point for map view
export const calculateCenterPoint = (points) => {
  if (!points || points.length === 0) return null;

  const sum = points.reduce(
    (acc, point) => {
      return {
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      };
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
};
