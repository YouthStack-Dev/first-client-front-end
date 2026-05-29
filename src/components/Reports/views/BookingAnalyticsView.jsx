const BookingAnalyticsView = ({ data, onClose }) => (
  <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-900">Booking Analytics</h2>
      <button onClick={onClose} className="text-sm text-red-600 underline">Close</button>
    </div>
    <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
  </div>
);
export default BookingAnalyticsView;