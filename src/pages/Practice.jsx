import { useCallback, useEffect, useRef, useState } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { stops } from "../staticData/routedata";

const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

const Practice = () => {
  const [logType, setLogType] = useState("IN");
  const [routePoints, setRoutePoints] = useState([]);
  const [companyLocation, setCompanyLocation] = useState({
    lat: 12.933463,
    lng: 77.540186,
  });
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  /** Initialize DirectionsRenderer */
  const initializeDirectionsRenderer = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      preserveViewport: true,
      map: mapRef.current,
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
    });
  }, []);

  /** On Map Load */
  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      setIsApiLoaded(true);
      initializeDirectionsRenderer();
    },
    [initializeDirectionsRenderer]
  );

  /** Prepare route points based on log type */
  useEffect(() => {
    const pickupPoints = stops.map((s) => ({
      lat: parseFloat(s.pickup_latitude),
      lng: parseFloat(s.pickup_longitude),
    }));

    const dropPoints = stops.map((s) => ({
      lat: parseFloat(s.drop_latitude),
      lng: parseFloat(s.drop_longitude),
    }));

    const validPickup = pickupPoints.filter(
      (p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)
    );
    const validDrop = dropPoints.filter(
      (p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)
    );

    // Add company location to route based on type
    const points =
      logType === "IN"
        ? [...validPickup, companyLocation] // pickups → company
        : [companyLocation, ...validDrop]; // company → drops

    setRoutePoints(points);
  }, [logType, companyLocation]);

  /** Generate Route */
  const generateRoute = useCallback(async () => {
    if (!isApiLoaded || !window.google || !mapRef.current) return;
    if (routePoints.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = routePoints.slice(1, -1).map((p) => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      stopover: true,
    }));

    const request = {
      origin: new window.google.maps.LatLng(
        routePoints[0].lat,
        routePoints[0].lng
      ),
      destination: new window.google.maps.LatLng(
        routePoints[routePoints.length - 1].lat,
        routePoints[routePoints.length - 1].lng
      ),
      waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    directionsService.route(request, (result, status) => {
      if (
        status === window.google.maps.DirectionsStatus.OK &&
        directionsRendererRef.current
      ) {
        directionsRendererRef.current.setDirections(result);
      }
    });
  }, [routePoints, isApiLoaded]);

  /** Map Component */
  const MapComponent = () => {
    const map = useMap();

    useEffect(() => {
      if (map) handleMapLoad(map);
    }, [map, handleMapLoad]);

    return (
      <>
        <Map
          defaultCenter={companyLocation}
          defaultZoom={11}
          mapId="company-route-map"
          gestureHandling="greedy"
        />
        {/* Company Location Marker */}
        <Marker position={companyLocation} title="Company Location" />
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT CONTROL PANEL */}
      <div className="w-[320px] bg-white shadow-lg border-r border-gray-200 flex flex-col justify-between">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Route Manager
          </h2>

          {/* Company Location Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Location (lat, lng)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={companyLocation.lat}
                onChange={(e) =>
                  setCompanyLocation((prev) => ({
                    ...prev,
                    lat: parseFloat(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                value={companyLocation.lng}
                onChange={(e) =>
                  setCompanyLocation((prev) => ({
                    ...prev,
                    lng: parseFloat(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Log Type Selector */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              Log Type:
            </label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="IN">IN (Pickup → Company)</option>
              <option value="OUT">OUT (Company → Drop)</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateRoute}
            disabled={!isApiLoaded}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
          >
            Generate Route
          </button>
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <MapComponent />
        </APIProvider>
      </div>
    </div>
  );
};

export default Practice;
