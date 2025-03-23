import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Routing = ({ fixedPoint, bookings }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const waypoints = [L.latLng(fixedPoint.lat, fixedPoint.lng), ...bookings.map(b => L.latLng(b.location.lat, b.location.lng))];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: true,
      createMarker: (i, waypoint, n) => {
        return L.marker(waypoint.latLng, { icon: customIcon });
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, fixedPoint, bookings]);

  return null;
};

const Map = ({ bookings, fixedPoint }) => {
  return (
    <MapContainer center={fixedPoint} zoom={13} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={fixedPoint} icon={customIcon} />
      <Routing fixedPoint={fixedPoint} bookings={bookings} />
    </MapContainer>
  );
};

export default Map;
