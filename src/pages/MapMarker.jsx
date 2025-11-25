// components/MapMarkers.jsx
import React from "react";
import { Marker } from "@vis.gl/react-google-maps";

const MapMarkers = ({ companyLocation, selectedRoutes, onMarkerClick }) => {
  return (
    <>
      {/* Company HQ Marker */}
      <Marker
        position={companyLocation}
        icon={{
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
          scale: 1.5,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          anchor: { x: 12, y: 24 },
        }}
        title="Company HQ"
      />

      {/* Vehicle Markers for all selected routes */}
      {selectedRoutes.map((route) => (
        <Marker
          key={`${route.id}-${route.currentLocation.lat}-${route.currentLocation.lng}`}
          position={route.currentLocation}
          onClick={() => onMarkerClick(route.id)}
          icon={{
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
            scale: 1.5,
            fillColor: route.isLoading
              ? "#6B7280"
              : route.status === "Delayed"
              ? "#B91C1C"
              : "#047857",
            fillOpacity: route.isLoading ? 0.8 : 1,
            strokeColor: "#000000",
            strokeWeight: 1.5,
            anchor: { x: 12, y: 24 },
          }}
          title={route.vehicleNumber}
        />
      ))}
    </>
  );
};

export default MapMarkers;
