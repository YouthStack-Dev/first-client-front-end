import React, { useState } from 'react';

const Calendar = ({ onClose, onApply }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3));
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

  const disabledDates = ['2025-04-10', '2025-04-15', '2025-04-20', '2025-05-01', '2025-05-05'];

  const isDisabled = (date) => disabledDates.includes(date.toISOString().split('T')[0]);

  const isInRange = (date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const handleDateClick = (date) => {
    if (isDisabled(date)) return;
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else {
      if (date < selectedRange.start) {
        setSelectedRange({ start: date, end: selectedRange.start });
      } else {
        setSelectedRange({ ...selectedRange, end: date });
      }
    }
  };

  const getSelectedDates = () => {
    if (!selectedRange.start || !selectedRange.end) return [];
    const dates = [];
    const date = new Date(selectedRange.start);
    while (date <= selectedRange.end) {
      const d = new Date(date);
      const str = d.toISOString().split('T')[0];
      if (!isDisabled(d)) dates.push(str);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderMonth = (year, month, monthName) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      const isSelected =
        selectedRange.start?.toDateString() === thisDate.toDateString() ||
        selectedRange.end?.toDateString() === thisDate.toDateString();
      const inRange = isInRange(thisDate);
      const disabled = isDisabled(thisDate);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(thisDate)}
          className={`text-center p-2 cursor-pointer rounded 
            ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''} 
            ${isSelected ? 'bg-blue-500 text-white' : ''} 
            ${inRange && !isSelected ? 'bg-blue-100' : ''}`}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="w-1/2 p-2">
        <h2 className="text-center font-bold text-lg mb-2">{monthName} {year}</h2>
        <div className="grid grid-cols-7 gap-1 text-gray-500 text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center p-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const month1 = currentDate.getMonth();
  const month2 = (currentDate.getMonth() + 1) % 12;
  const year1 = currentDate.getFullYear();
  const year2 = month2 === 0 ? year1 + 1 : year1;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white max-w-2xl w-full p-6 rounded shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="text-2xl">&larr;</button>
          <div className="flex w-full justify-center">
            {renderMonth(year1, month1, monthNames[month1])}
            {renderMonth(year2, month2, monthNames[month2])}
          </div>
          <button onClick={handleNextMonth} className="text-2xl">&rarr;</button>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onApply({
                start: selectedRange.start,
                end: selectedRange.end,
                dates: getSelectedDates(),
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
