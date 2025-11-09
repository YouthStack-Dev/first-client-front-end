import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const GoogleMapView = ({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 12,
  mapId = "route-cluster-map",
  disableDefaultUI = false,
  gestureHandling = "greedy",
  children,
  className = "flex-1 relative",
  onMapClick,
  onMapLoad,
}) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";
  return (
    <div className={className}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId={mapId}
          disableDefaultUI={disableDefaultUI}
          gestureHandling={gestureHandling}
          onClick={onMapClick}
          onLoad={onMapLoad}
        >
          {children}
        </Map>
      </APIProvider>
    </div>
  );
};

export default GoogleMapView;
