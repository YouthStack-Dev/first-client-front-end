import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import React, { useRef, useEffect, useState } from 'react';
import { logDebug } from '../utils/logger';

const fixedPoint = { lat: 12.9716, lng: 77.5946 };

const MapContent = ({ homePosition, setHomePosition, setAddress, landmarkInputRef, setLandmark }) => {
  const map = useMap();
  const inputRef = useRef(null); // For address search
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const handleGoToCompany = () => {
    if (map) {
      console.log('Panning to company location:', fixedPoint);
      map.panTo(fixedPoint);
      map.setZoom(14);
    } else {
      console.error('Map instance not available yet.');
    }
  };

  logDebug(" this is the home position " ,homePosition)

  // Effect for Landmark Autocomplete
  useEffect(() => {
    // Ensure both ref and window.google.maps are available
    if (!landmarkInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;

    const createAutocomplete = () => {
      const landmarkAutocomplete = new window.google.maps.places.Autocomplete(landmarkInputRef.current, {
        fields: ['name', 'formatted_address'],
      });

      // If homePosition exists, bias results to nearby area
      if (homePosition) {
        const circle = new window.google.maps.Circle({
          center: homePosition,
          radius: 2000, // 2km radius for nearby landmarks
        });
        landmarkAutocomplete.setBounds(circle.getBounds());
        landmarkAutocomplete.setOptions({ strictBounds: false });
      }

      const placeChangedListener = landmarkAutocomplete.addListener('place_changed', () => {
        const place = landmarkAutocomplete.getPlace();
        if (place && place.name) {
          setLandmark(place.name);
        } else if (place && place.formatted_address) {
          setLandmark(place.formatted_address);
        }
      });

      return () => {
        // Clean up the listener when the component unmounts or dependencies change
        window.google.maps.event.removeListener(placeChangedListener);
      };
    };

    // Use an interval to wait for window.google.maps to be ready
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        createAutocomplete();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [homePosition, landmarkInputRef, setLandmark]);


  // Effect for Home Address Autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
        const placeChangedListener = autocomplete.addListener('place_changed', () => {
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
        });
        clearInterval(interval);
        return () => window.google.maps.event.removeListener(placeChangedListener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [map, setHomePosition, setAddress]);

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={fixedPoint}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
<Marker
  position={fixedPoint}
  title="Company (Bangalore)"
  icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
  onClick={() => setShowCompanyInfo(true)}
/>

{showCompanyInfo && (
  <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">
    📍 <strong>Company:</strong> Bangalore HQ
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
            // Call reverse geocoding to get the address for the new position
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: newPosition }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  setAddress(results[0].formatted_address);
                }
              });
            }
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


      {/* Bottom right floating button, vertically centered */}
      <button
        onClick={handleGoToCompany}
        className="absolute bottom-1/2 right-4 translate-y-1/2 bg-blue-500 text-white rounded-full p-3 shadow hover:bg-blue-600 transition"
        title="Go to Company"
      >
        CP
      </button>
    </div>
  );
};

export default MapContent;