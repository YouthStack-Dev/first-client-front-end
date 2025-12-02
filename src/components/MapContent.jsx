import { Map, Marker, useMap } from "@vis.gl/react-google-maps";
import React, { useRef, useEffect, useState } from "react";

// Remove the hardcoded fixedPoint and get from localStorage
const getCompanyLocation = () => {
  try {
    const companyLocation = localStorage.getItem("tenant");
    if (companyLocation) {
      const parsed = JSON.parse(companyLocation);
      return {
        lat: parseFloat(parsed.latitude),
        lng: parseFloat(parsed.longitude),
      };
    }
  } catch (error) {
    console.error("Error parsing company location from localStorage:", error);
  }

  // Fallback to Bangalore if not found in localStorage
  return { lat: 12.9716, lng: 77.5946 };
};

const MapContent = ({
  homePosition,
  setHomePosition,
  setAddress,
  landmarkInputRef,
  setLandmark,
}) => {
  const map = useMap();
  const inputRef = useRef(null); // For address search
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  // Get company location from localStorage
  const [companyLocation, setCompanyLocation] = useState(getCompanyLocation());

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCompanyLocation(getCompanyLocation());
    };

    // Listen for storage events (changes from other tabs/windows)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes in the same tab
    const interval = setInterval(() => {
      const currentLocation = getCompanyLocation();
      if (
        currentLocation.lat !== companyLocation.lat ||
        currentLocation.lng !== companyLocation.lng
      ) {
        setCompanyLocation(currentLocation);
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [companyLocation]);

  const handleGoToCompany = () => {
    if (map && companyLocation) {
      console.log("Panning to company location:", companyLocation);
      map.panTo(companyLocation);
      map.setZoom(14);
    } else {
      console.error("Map instance not available yet.");
    }
  };

  // Effect for Landmark Autocomplete
  useEffect(() => {
    if (
      !landmarkInputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    )
      return;

    const createAutocomplete = () => {
      const landmarkAutocomplete = new window.google.maps.places.Autocomplete(
        landmarkInputRef.current,
        {
          fields: ["name", "formatted_address"],
        }
      );

      if (homePosition) {
        const circle = new window.google.maps.Circle({
          center: homePosition,
          radius: 2000, // 2km radius for nearby landmarks
        });
        landmarkAutocomplete.setBounds(circle.getBounds());
        landmarkAutocomplete.setOptions({ strictBounds: false });
      }

      const placeChangedListener = landmarkAutocomplete.addListener(
        "place_changed",
        () => {
          const place = landmarkAutocomplete.getPlace();
          if (place && place.name) {
            setLandmark(place.name);
          } else if (place && place.formatted_address) {
            setLandmark(place.formatted_address);
          }
        }
      );

      return () => {
        window.google.maps.event.removeListener(placeChangedListener);
      };
    };

    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        createAutocomplete();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [homePosition, landmarkInputRef, setLandmark]);

  // Effect for Home Address Autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current
        );
        const placeChangedListener = autocomplete.addListener(
          "place_changed",
          () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const newPosition = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              setHomePosition(newPosition);
              if (place.formatted_address) {
                setAddress(place.formatted_address);
              } else if (place.name) {
                setAddress(place.name);
              }
              if (map) {
                map.panTo(newPosition);
                map.setZoom(14);
              }
            }
          }
        );
        clearInterval(interval);
        return () =>
          window.google.maps.event.removeListener(placeChangedListener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [map, setHomePosition, setAddress]);

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={companyLocation} // Use company location as default center
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Company Marker from localStorage */}
        {companyLocation && (
          <Marker
            position={companyLocation}
            title="Company Location"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
            onClick={() => setShowCompanyInfo(true)}
          />
        )}

        {showCompanyInfo && companyLocation && (
          <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm border border-green-400">
            📍 <strong>Company Location</strong>
            <br />
            Lat: {companyLocation.lat.toFixed(6)}
            <br />
            Lng: {companyLocation.lng.toFixed(6)}
          </div>
        )}

        {homePosition && (
          <Marker
            position={homePosition}
            title="Home"
            draggable
            onDragEnd={(e) => {
              const newPosition = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              setHomePosition(newPosition);
              if (map) {
                map.panTo(newPosition);
              }
            }}
          />
        )}
      </Map>

      {/* Top right controls for address search */}
      <div className="gap-2 bg-blue-500 absolute top-1 left-3/4 transform -translate-x-1/2 rounded shadow w-[300px] p-1">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search & set home location"
          className="border p-2 rounded shadow w-full"
        />
      </div>

      {/* Bottom right floating button */}
      <button
        onClick={handleGoToCompany}
        className="absolute bottom-1/2 right-4 translate-y-1/2 bg-green-500 text-white rounded-full p-3 shadow hover:bg-green-600 transition"
        title="Go to Company Location"
      >
        CP
      </button>
    </div>
  );
};

export default MapContent;
