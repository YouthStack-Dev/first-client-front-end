// import React, { useState, useMemo } from "react";
// import ScheduleBooks from "../../staticData/ScheduleBooks";
// import ToolBar from "../ui/ToolBar"; // adjust path if needed

// const ScheduleOfficeBooking = ({ toggleRouting, setOfficeData }) => {
//   const [selectedDate, setSelectedDate] = useState("");

//   const handleOfficeClick = (office) => {
//     setOfficeData({ office, selectedDate });
//     toggleRouting("booking");
//   };

//   const officeSummaries = useMemo(() => {
//     if (!selectedDate || !ScheduleBooks[selectedDate]?.TimeShifts) return [];

//     const shifts = ScheduleBooks[selectedDate].TimeShifts;
//     const officeMap = {};

//     shifts.forEach((shift) => {
//       if (!officeMap[shift.office]) {
//         officeMap[shift.office] = {
//           office: shift.office,
//           shifts: 0,
//           schedules: 0,
//           shiftsNotRouted: 0,
//           tripsNotGenerated: 0,
//           plannedTrips: 0,
//         };
//       }
//       officeMap[shift.office].shifts += 1;
//       officeMap[shift.office].schedules += shift.bookings.length;
//       officeMap[shift.office].shiftsNotRouted += shift.routes.length === 0 ? 1 : 0;
//       officeMap[shift.office].plannedTrips += shift.bookings.length;
//     });

//     return Object.values(officeMap);
//   }, [selectedDate]);

//   return (
//     <div className="p-6">
//       {/* 🔹 Reusable Toolbar */}
//       <ToolBar
//         title="Office Booking"
//         subtitle="View bookings by office and date"
//         leftElements={[
//           <div key="date-picker" className="flex items-center gap-2">
//             <label className="font-medium">Select Date:</label>
//             <input
//               type="date"
//               className="border px-3 py-2 rounded text-sm"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </div>,
//         ]}
//       />

//       {/* Table or messages */}
//       <div className="mt-6">
//         {selectedDate ? (
//           officeSummaries.length > 0 ? (
//             <div className="overflow-x-auto shadow rounded-lg">
//               <table className="min-w-full border border-gray-300">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="border px-4 py-2 text-left">Office</th>
//                     <th className="border px-4 py-2 text-center">Shifts</th>
//                     <th className="border px-4 py-2 text-center">Schedules</th>
//                     <th className="border px-4 py-2 text-center">Shifts Not Routed</th>
//                     <th className="border px-4 py-2 text-center">Trips Not Generated</th>
//                     <th className="border px-4 py-2 text-center">Planned Trips</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {officeSummaries.map((item, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td
//                         className="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
//                         onClick={() => handleOfficeClick(item.office)}
//                       >
//                         {item.office}
//                       </td>
//                       <td className="border px-4 py-2 text-center">{item.shifts}</td>
//                       <td className="border px-4 py-2 text-center">{item.schedules}</td>
//                       <td className="border px-4 py-2 text-center">{item.shiftsNotRouted}</td>
//                       <td className="border px-4 py-2 text-center">{item.tripsNotGenerated}</td>
//                       <td className="border px-4 py-2 text-center">{item.plannedTrips}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-gray-500">No bookings available for this date.</p>
//           )
//         ) : (
//           <p className="text-gray-500">Please select a date to view office bookings.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ScheduleOfficeBooking;



import React, { useState } from "react";
import ToolBar from "../ui/ToolBar";

const ScheduleOfficeBooking = ({ toggleRouting, setSelectedDate }) => {
  const [selectedDate, setLocalSelectedDate] = useState("");

  const handleDateChange = (e) => {
    const date = e.target.value;
    setLocalSelectedDate(date);       
    if (date) {
      setSelectedDate(date);           
      toggleRouting("booking");        
    }
  };

  return (
    <div className="p-6">
      <ToolBar
        title="Schedule Shifts"
        subtitle="Pick a date to view booked shifts"
        leftElements={[
          <div key="date-picker" className="flex items-center gap-2">
            <label className="font-medium text-sm">Date:</label>
            <input
              type="date"
              className="border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>,
        ]}
      />
    </div>
  );
};

export default ScheduleOfficeBooking;
