const ScheduleBooks = {
  "2025-08-19": {
    TimeShifts: [
      {
        office: "STONEX",
        shift: "Morning",
        bookingType: "LOGIN",
        routes: [
          { vehicleId: 1, vendorId: 101 },
          { vehicleId: 2, vendorId: 102 },
        ],
        bookings: [
          {
            id: 1,
            customer: { name: "John Doe", phoneNo: "1234567890", gender: "Male", address: "Office A" },
            pickupAddress: "Pickup Point 1",
            dropAddress: "Drop Point 1",
          },
          {
            id: 2,
            customer: { name: "Jane Smith", phoneNo: "9876543210", gender: "Female", address: "Office A" },
            pickupAddress: "Pickup Point 2",
            dropAddress: "Drop Point 2",
          },
        ],
      },
      {
        office: "STONEX",
        shift: "Evening",
        bookingType: "LOGOUT",
        routes: [],
        bookings: [],
      },
      {
        office: "STONEX_PUNE",
        shift: "Morning",
        bookingType: "LOGIN",
        routes: [],
        bookings: [],
      },
    ],
  },

  "2025-08-20": {
    TimeShifts: [
      {
        office: "STONEX",
        shift: "Morning",
        bookingType: "LOGIN",
        routes: [
          { vehicleId: 3, vendorId: 101 },
        ],
        bookings: [
          {
            id: 3,
            customer: { name: "Alice Brown", phoneNo: "5551234567", gender: "Female", address: "Office B" },
            pickupAddress: "Pickup Point 3",
            dropAddress: "Drop Point 3",
          },
        ],
      },
      {
        office: "STONEX_PUNE",
        shift: "Evening",
        bookingType: "LOGOUT",
        routes: [],
        bookings: [],
      },
    ],
  },
};

export default ScheduleBooks;
