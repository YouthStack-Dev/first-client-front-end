import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const staticPoints = [
  { id: '1', location: { lat: 37.7749, lng: -122.4194 } }, // San Francisco
  { id: '2', location: { lat: 37.3382, lng: -121.8863 } }, // San Jose
  { id: '3', location: { lat: 37.7749, lng: -121.5000 } }, // Example Point
];

const staticBookings = [
  { id: '101', location: { lat: 37.7849, lng: -122.4094 }, selected: true, routeGroupId: null },
  { id: '102', location: { lat: 37.7680, lng: -122.4300 }, selected: true, routeGroupId: 'group1' },
];

const staticRouteGroups = [
  { id: 'group1', name: 'Route Group 1' },
];

const Routing = ({ bookings = staticBookings, routeGroups = staticRouteGroups, fixedPoint = { lat: 37.7749, lng: -122.4194 } }) => {
  const selectedBookings = bookings.filter((booking) => booking.selected && !booking.routeGroupId);

  const getRouteColor = (groupId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(groupId.replace(/\D/g, ''), 10) % colors.length;
    return colors[index];
  };

  return (
    <MapContainer center={fixedPoint} zoom={13} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      
      {/* Fixed Point Marker */}
      <Marker position={fixedPoint} icon={customIcon} />

      {/* Static Points */}
      {staticPoints.map((point) => (
        <Marker key={point.id} position={point.location} icon={customIcon} />
      ))}
      <Polyline
        positions={[fixedPoint, ...staticPoints.map(point => point.location)]}
        color="green"
        weight={4}
        opacity={0.7}
      />

      {/* Selected (but not grouped) Bookings */}
      {selectedBookings.map((booking) => (
        <Marker key={booking.id} position={booking.location} icon={customIcon} />
      ))}
      {selectedBookings.map((booking) => (
        <Polyline key={`polyline-${booking.id}`} positions={[fixedPoint, booking.location]} color="blue" weight={3} opacity={0.6} />
      ))}

      {/* Grouped Routes */}
      {routeGroups.map((group) => {
        const groupBookings = bookings.filter((b) => b.routeGroupId === group.id);
        const routeColor = getRouteColor(group.id);
        
        return groupBookings.map((booking) => (
          <>
            <Marker key={booking.id} position={booking.location} icon={customIcon} />
            <Polyline key={`polyline-${booking.id}`} positions={[fixedPoint, booking.location]} color={routeColor} weight={4} opacity={0.8} />
          </>
        ));
      })}
    </MapContainer>
  );
};

export default Routing;