import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';

const FlexibleMap = ({
  defaultCenter = { lat: 12.9716, lng: 77.5946 },
  defaultZoom = 12,
  markers = [],
  onAddressSelect,
  onLandmarkSelect,
  showSearchBox = false,
  showLandmarkSearch = false,
  enablePanToCompany = false,
  companyInfo = null,
  trackingMarker = null, // New prop for tracking marker position
}) => {
  const map = useMap();
  const addressInputRef = useRef(null);
  const landmarkInputRef = useRef(null);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handlePanToCompany = () => {
    if (map && companyInfo?.location) {
      map.panTo(companyInfo.location);
      map.setZoom(14);
      setShowCompanyInfo(true);
    }
  };

  // Setup Address Autocomplete
  useEffect(() => {
    if (!showSearchBox || !addressInputRef.current) return;

    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current);
        const listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const position = {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          };
          const address = place.formatted_address || place.name;
          if (onAddressSelect) onAddressSelect(position, address);
          map?.panTo(position);
        });
        clearInterval(interval);
        return () => window.google.maps.event.removeListener(listener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showSearchBox, onAddressSelect]);

  // Setup Landmark Autocomplete
  useEffect(() => {
    if (!showLandmarkSearch || !landmarkInputRef.current) return;

    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(landmarkInputRef.current, {
          fields: ['name', 'formatted_address'],
        });

        const listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const name = place.name || place.formatted_address;
          if (onLandmarkSelect) onLandmarkSelect(name);
        });

        clearInterval(interval);
        return () => window.google.maps.event.removeListener(listener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showLandmarkSearch, onLandmarkSelect]);

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Render dynamic markers */}
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.position}
            title={marker.title}
            draggable={marker.draggable}
            icon={marker.icon ? { url: marker.icon } : undefined}
            onDragEnd={(e) => {
              if (marker.onDragEnd) {
                marker.onDragEnd({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                });
              }
            }}
          />
        ))}

        {/* Company Marker */}
        {companyInfo?.location && (
          <Marker
            position={companyInfo.location}
            title={companyInfo.label}
            icon={{ url: companyInfo.iconUrl || 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            onClick={() => setShowCompanyInfo(true)}
          />
        )}

        {/* Tracking Marker */}
        {trackingMarker && (
          <Marker
            position={trackingMarker}
            title="Tracking Location"
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
          />
        )}
      </Map>

      {/* Company Info Bubble */}
      {showCompanyInfo && companyInfo?.label && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm z-10">
          📍 <strong>{companyInfo.label}</strong>
        </div>
      )}

      {/* Address Search Box */}
      {showSearchBox && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[300px] z-10">
          <input
            ref={addressInputRef}
            type="text"
            placeholder="Search & select location"
            className="border p-2 rounded shadow w-full"
          />
        </div>
      )}

      {/* Landmark Search Box */}
      {showLandmarkSearch && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[300px] z-10">
          <input
            ref={landmarkInputRef}
            type="text"
            placeholder="Search nearby landmark"
            className="border p-2 rounded shadow w-full"
          />
        </div>
      )}

      {/* Pan to Company Button */}
      {enablePanToCompany && companyInfo?.location && (
        <button
          onClick={handlePanToCompany}
          className="absolute bottom-1/2 right-4 translate-y-1/2 bg-blue-500 text-white rounded-full p-3 shadow hover:bg-blue-600 transition z-10"
          title="Go to Company"
        >
          CP
        </button>
      )}
    </div>
  );
};

export default FlexibleMap;