import React, { useState } from 'react';
import Calendar from './Calendar'; // path to your calendar file

const CalendarPopupExample = () => {
    const [showCalendar, setShowCalendar] = useState(false);

    const handleApply = ({ start, end, dates }) => {
      console.log("Start Date:", start);
      console.log("End Date:", end);
      console.log("Selected Dates:", dates);
      setShowCalendar(false);
    };
  
  return (
    <div className="p-10">
    <button
      onClick={() => setShowCalendar(true)}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Select Date Range
    </button>

    {showCalendar && (
      <Calendar onClose={() => setShowCalendar(false)} onApply={handleApply} />
    )}
  </div>
  );
};

export default CalendarPopupExample;
