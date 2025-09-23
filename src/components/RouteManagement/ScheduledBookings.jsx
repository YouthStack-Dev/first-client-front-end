import React, { useEffect, useState } from "react";
import ToolBar from "../ui/ToolBar";
import { API_CLIENT } from "../../Api/API_Client";
import ScheduledBookingsList from "./ScheduledBookingsList";

const ScheduledBookings = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
// bookings/get-scheduled-bookings?companyId=3&date=2025-09-06
  // fetch bookings when date changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return; // don’t fetch until a date is chosen
      setLoading(true);
      try {
        const response = await API_CLIENT.get("api/bookings/get-scheduled-bookings", {
          params: { date: selectedDate, companyId: 1 }
        });
        setBookings(response.data.bookings);
        console.log("Bookings fetched:", response.data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate, selectedShiftType]); // re-fetch on date or shift type change

  const [bookingsData, setBookingsData] = useState([
    {
      id: 1,
      shiftType: 'LOGIN',
      shiftTime: '08:00 AM',
      status: 'Scheduled',
      routesCount: 5,
      vendorCount: 3,
      vehicleCount: 8,
      employeeCount: 12,
      routes: [
        { id: 'R001', vendor: 'Vendor A', vehicle: 'KA-01-AB-1234' },
        { id: 'R002', vendor: 'Vendor B', vehicle: 'KA-02-CD-5678' },
        { id: 'R003', vendor: 'Vendor C', vehicle: 'KA-03-EF-9012' },
        { id: 'R004', vendor: 'Vendor A', vehicle: 'KA-04-GH-3456' },
        { id: 'R005', vendor: 'Vendor D', vehicle: 'KA-05-IJ-7890' }
      ],
      vendors: [
        { id: 'V001', name: 'Vendor A', routes: ['R001', 'R004'] },
        { id: 'V002', name: 'Vendor B', routes: ['R002'] },
        { id: 'V003', name: 'Vendor C', routes: ['R003'] },
        { id: 'V004', name: 'Vendor D', routes: ['R005'] }
      ],
      vehicles: [
        { id: 'VH001', number: 'KA-01-AB-1234', route: 'R001' },
        { id: 'VH002', number: 'KA-02-CD-5678', route: 'R002' },
        { id: 'VH003', number: 'KA-03-EF-9012', route: 'R003' },
        { id: 'VH004', number: 'KA-04-GH-3456', route: 'R004' },
        { id: 'VH005', number: 'KA-05-IJ-7890', route: 'R005' },
        { id: 'VH006', number: 'KA-06-KL-1357' },
        { id: 'VH007', number: 'KA-07-MN-2468' },
        { id: 'VH008', number: 'KA-08-OP-3690' }
      ],
      employees: [
        { id: 'E001', name: 'Rajesh Kumar', phone: '9876543210', gender: 'Male', office: 'Main Branch', pickup: 'MG Road', drop: 'Electronic City' },
        { id: 'E002', name: 'Priya Sharma', phone: '8765432109', gender: 'Female', office: 'Downtown Branch', pickup: 'Indiranagar', drop: 'Whitefield' },
        { id: 'E003', name: 'Amit Patel', phone: '7654321098', gender: 'Male', office: 'Main Branch', pickup: 'Jayanagar', drop: 'HSR Layout' },
        { id: 'E004', name: 'Sneha Reddy', phone: '6543210987', gender: 'Female', office: 'City Center', pickup: 'Koramangala', drop: 'BTM Layout' },
        { id: 'E005', name: 'Vikram Singh', phone: '5432109876', gender: 'Male', office: 'Main Branch', pickup: 'Yeshwanthpur', drop: 'Malleswaram' },
        { id: 'E006', name: 'Anjali Mehta', phone: '4321098765', gender: 'Female', office: 'Downtown Branch', pickup: 'Hebbal', drop: 'Yelahanka' }
      ]
    },
    {
      id: 2,
      shiftType: 'LOGOUT',
      shiftTime: '05:00 PM',
      status: 'Pending',
      routesCount: 2,
      vendorCount: 1,
      vehicleCount: 4,
      employeeCount: 8,
      routes: [
        { id: 'R101', vendor: 'Vendor X', vehicle: 'KA-09-QR-1122' },
        { id: 'R102', vendor: 'Vendor X', vehicle: 'KA-10-ST-3344' }
      ],
      vendors: [
        { id: 'V101', name: 'Vendor X', routes: ['R101', 'R102'] }
      ],
      vehicles: [
        { id: 'VH101', number: 'KA-09-QR-1122', route: 'R101' },
        { id: 'VH102', number: 'KA-10-ST-3344', route: 'R102' },
        { id: 'VH103', number: 'KA-11-UV-5566' },
        { id: 'VH104', number: 'KA-12-WX-7788' }
      ],
      employees: [
        { id: 'E101', name: 'Rahul Verma', phone: '3210987654', gender: 'Male', office: 'Main Branch', pickup: 'Silk Board', drop: 'Marathahalli' },
        { id: 'E102', name: 'Neha Gupta', phone: '2109876543', gender: 'Female', office: 'City Center', pickup: 'KR Puram', drop: 'Tin Factory' },
        { id: 'E103', name: 'Sanjay Joshi', phone: '1098765432', gender: 'Male', office: 'Downtown Branch', pickup: 'Banashankari', drop: 'Jayanagar' },
        { id: 'E104', name: 'Pooja Desai', phone: '0987654321', gender: 'Female', office: 'Main Branch', pickup: 'HSR Layout', drop: 'Bellandur' }
      ]
    }
  ]);

  // Function to handle actions from the child component
  const handleGenerateRoute = (bookingId) => {
    console.log(`Generating route for booking ${bookingId}`);
    // Your implementation for generating routes
  };

  const handleDeleteRoute = (bookingId) => {
    console.log(`Deleting booking ${bookingId}`);
    setBookingsData(prev => prev.filter(booking => booking.id !== bookingId));
  };
  return (
    <div>
      <ToolBar
        className="p-4 bg-white border rounded shadow-sm mb-4"
        leftElements={
          <div className="flex items-center gap-4">
            {/* Date Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>

            {/* Shift Type Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Shift Type</label>
              <select
                value={selectedShiftType}
                onChange={(e) => setSelectedShiftType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="All">All</option>
                <option value="In">LogIn</option>
                <option value="Out">LogOut</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Bookings Display */}
      <ScheduledBookingsList 
        bookings={bookingsData}
        onGenerateRoute={handleGenerateRoute}
        onDeleteRoute={handleDeleteRoute}
      />
    </div>
  );
};

export default ScheduledBookings;
