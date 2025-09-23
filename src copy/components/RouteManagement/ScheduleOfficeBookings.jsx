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
