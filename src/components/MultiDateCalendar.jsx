import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function MultiDateCalendar({
  selectedDates,
  onDateSelect,
  restrictedDays,
  restrictedDates = [], // Add this new prop for specific holiday dates
  monthsForward,
  onNext,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateRestricted = (date) => {
    const dayOfWeek = date.getDay();
    const dateStr = formatDate(date);

    // Check if it's a restricted day of week OR a specific holiday date
    return (
      restrictedDays.includes(dayOfWeek) || restrictedDates.includes(dateStr)
    );
  };

  const isDateInRange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + monthsForward);

    return date >= today && date <= maxDate;
  };

  const isDateSelected = (dateStr) => {
    return selectedDates.includes(dateStr);
  };

  const handleDateClick = (date) => {
    if (isDateRestricted(date) || !isDateInRange(date)) return;

    if (!rangeStart) {
      setRangeStart(date);
      onDateSelect([formatDate(date)]);
    } else {
      const start = rangeStart < date ? rangeStart : date;
      const end = rangeStart < date ? date : rangeStart;
      const dates = [];

      const current = new Date(start);
      while (current <= end) {
        if (!isDateRestricted(current) && isDateInRange(current)) {
          dates.push(formatDate(current));
        }
        current.setDate(current.getDate() + 1);
      }

      onDateSelect(dates.sort());
      setRangeStart(null);
    }
  };

  const isInSelectedRange = (date) => {
    if (!rangeStart) return false;
    const start = rangeStart < date ? rangeStart : date;
    const end = rangeStart < date ? date : rangeStart;
    return date >= start && date <= end;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateStr = formatDate(date);
      const isRestricted = isDateRestricted(date);
      const isInRange = isDateInRange(date);
      const isSelected = isDateSelected(dateStr);
      const isInHoverRange = isInSelectedRange(date);
      const isDisabled = isRestricted || !isInRange;

      // Check if this date is a holiday (specific date restriction)
      const isHoliday = restrictedDates.includes(dateStr);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled}
          className={`
            h-12 rounded-lg text-sm font-medium transition-all relative
            ${
              isSelected
                ? "bg-blue-600 text-white shadow-md scale-95"
                : isInHoverRange && rangeStart
                ? "bg-blue-200 text-blue-800"
                : isDisabled
                ? "text-gray-300 cursor-not-allowed bg-gray-50"
                : "text-gray-700 hover:bg-blue-50 hover:scale-105"
            }
            ${isHoliday && !isSelected ? "bg-red-50" : ""}
          `}
          title={isHoliday ? "Holiday" : ""}
        >
          {day}
          {isHoliday && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthsForward
    );
    const nextMonthDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );

    if (nextMonthDate <= maxDate) {
      setCurrentMonth(nextMonthDate);
    }
  };

  const canGoPrevious = () => {
    const today = new Date();
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    return (
      prevMonth.getMonth() >= today.getMonth() &&
      prevMonth.getFullYear() >= today.getFullYear()
    );
  };

  const canGoNext = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthsForward
    );
    const nextMonthDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    return nextMonthDate <= maxDate;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          disabled={!canGoPrevious()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          disabled={!canGoNext()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>

      {/* Legend for restricted dates */}
      {restrictedDates.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Holiday</span>
          </div>
        </div>
      )}

      {selectedDates.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Selected Dates ({selectedDates.length})
            </p>
            <button
              onClick={() => {
                onDateSelect([]);
                setRangeStart(null);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDates.map((date) => (
              <span
                key={date}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ))}
          </div>
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Next: Select Shift
          </button>
        </div>
      )}
    </div>
  );
}
