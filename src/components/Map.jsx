import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Map = ({ bookings, routeGroups, fixedPoint }) => {
  const selectedBookings = bookings.filter(booking => booking.selected);
  const groupedBookings = bookings.filter(booking => booking.routeGroupId);

  const getRouteColor = (groupId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(groupId.replace(/\D/g, '')) % colors.length;
    return colors[index];
  };

  return (
    <MapContainer center={fixedPoint} zoom={13} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <Marker position={fixedPoint} icon={customIcon} />
      
      {selectedBookings.map((booking) => (
        !booking.routeGroupId && (
          <>
            <Marker 
              key={`marker-${booking.id}`}
              position={booking.location}
              icon={customIcon}
            />
            <Polyline
              key={`polyline-${booking.id}`}
              positions={[fixedPoint, booking.location]}
              color="blue"
              weight={3}
              opacity={0.6}
            />
          </>
        )
      ))}
      
      {routeGroups.map((group) => {
        const groupBookings = bookings.filter(b => b.routeGroupId === group.id);
        const routeColor = getRouteColor(group.id);
        
        return (
          <>
            {groupBookings.map((booking) => (
              <>
                <Marker 
                  key={`group-marker-${booking.id}`}
                  position={booking.location}
                  icon={customIcon}
                />
                <Polyline
                  key={`group-polyline-${booking.id}`}
                  positions={[fixedPoint, booking.location]}
                  color={routeColor}
                  weight={4}
                  opacity={0.8}
                />
              </>
            ))}
          </>
        );
      })}
    </MapContainer>
  );
};

export default Map;
