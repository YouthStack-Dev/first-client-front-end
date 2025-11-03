// Static route data
export const routeData = {
  route_clusters: [
    {
      cluster_id: 1,
      bookings: [
        {
          id: 1,
          lat: 40.7128,
          lng: -74.006,
          address: "123 Main St, New York, NY",
          customer: "John Doe",
          status: "pending",
        },
        {
          id: 2,
          lat: 40.7218,
          lng: -74.011,
          address: "456 Broadway, New York, NY",
          customer: "Jane Smith",
          status: "confirmed",
        },
        {
          id: 3,
          lat: 40.7058,
          lng: -74.009,
          address: "789 Wall St, New York, NY",
          customer: "Bob Johnson",
          status: "completed",
        },
      ],
      center: { lat: 40.7138, lng: -74.009 },
      name: "Downtown Cluster",
      location: "City Center",
    },
    {
      cluster_id: 2,
      bookings: [
        {
          id: 4,
          lat: 40.7828,
          lng: -73.965,
          address: "101 Central Park West, New York, NY",
          customer: "Alice Brown",
          status: "pending",
        },
        {
          id: 5,
          lat: 40.7728,
          lng: -73.955,
          address: "202 Museum Ave, New York, NY",
          customer: "Charlie Wilson",
          status: "confirmed",
        },
      ],
      center: { lat: 40.7778, lng: -73.96 },
      name: "Northside Cluster",
      location: "North Area",
    },
    {
      cluster_id: 3,
      bookings: [
        {
          id: 6,
          lat: 40.6828,
          lng: -73.975,
          address: "303 Park Slope, Brooklyn, NY",
          customer: "David Lee",
          status: "completed",
        },
        {
          id: 7,
          lat: 40.6728,
          lng: -73.985,
          address: "404 Prospect Park, Brooklyn, NY",
          customer: "Emma Davis",
          status: "confirmed",
        },
        {
          id: 8,
          lat: 40.6928,
          lng: -73.965,
          address: "505 Brooklyn Heights, Brooklyn, NY",
          customer: "Frank Miller",
          status: "pending",
        },
      ],
      center: { lat: 40.6828, lng: -73.975 },
      name: "South Park Cluster",
      location: "South District",
    },
  ],
};
