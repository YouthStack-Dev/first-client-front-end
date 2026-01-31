// components/modals/WeekOffModal.jsx
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { logDebug } from '@utils/logger';
import endpoint from '@Api/Endpoints';
import { API_CLIENT } from '@Api/API_Client';
import ReusableButton from '../ui/ReusableButton'; // Import the reusable button

const WeekOffModal = ({
  show = false,
  employee = null,
  initialWeekOff = null,
  onUpdate,
  onClose,
  isLoading = false,
}) => {
  const [weekOffData, setWeekOffData] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [updateLevel, setUpdateLevel] = useState('employee');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Fetch week off data when modal opens
  useEffect(() => {
    logDebug("WeekOffModal - useEffect triggered. show:", show, "employee:", employee);
    const fetchWeekOffData = async () => {
      if (!show || !employee?.employee_id) return;

      setIsFetching(true);
      setFetchError('');

      try {
        logDebug("Fetching week off data for employee:", employee.employee_id);
        
        const response = await API_CLIENT.get(`${endpoint.getWeekOff}${employee.employee_id}`);

        logDebug("Week off API response:", response.data);

        if (response.data.success && response.data.data?.weekoff_config) {
          const weekoffConfig = response.data.data.weekoff_config;
          
          // Map the API response to our state format
          const mappedWeekOffData = {
            monday: weekoffConfig.monday || false,
            tuesday: weekoffConfig.tuesday || false,
            wednesday: weekoffConfig.wednesday || false,
            thursday: weekoffConfig.thursday || false,
            friday: weekoffConfig.friday || false,
            saturday: weekoffConfig.saturday || false,
            sunday: weekoffConfig.sunday || false
          };
          
          setWeekOffData(mappedWeekOffData);
          logDebug("Mapped week off data:", mappedWeekOffData);
        } else {
          throw new Error(response.data.message || 'Failed to fetch week off data');
        }
      } catch (error) {
        console.error('Error fetching week off data:', error);
        setFetchError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load week off configuration'
        );
        
        // Fallback to initialWeekOff prop or employee.week_off if available
        const fallbackData = initialWeekOff || employee.week_off;
        if (fallbackData) {
          setWeekOffData(fallbackData);
          logDebug("Using fallback week off data:", fallbackData);
        }
      } finally {
        setIsFetching(false);
      }
    };

    if (show) {
      fetchWeekOffData();
    }
  }, [show, employee, initialWeekOff]);

  const handleWeekOffChange = (day) => {
    setWeekOffData(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    try {
      // Determine the endpoint based on update level
      const endpoints = updateLevel === 'employee' 
        ? `${endpoint.updateWeekOff}${employee.employee_id}`
        : `${endpoint.updateWeekOff}${employee.team_id}`;
      
      logDebug("Updating week off at endpoint:", endpoints, "with data:", weekOffData, "for level:", updateLevel);
      
      // Make API call to update week off
      const response = await API_CLIENT.put(endpoints, weekOffData);

      logDebug("Week off update response:", response.data);

      if (response.data.success) {
        // Call the parent component's onUpdate callback with the response data
        await onUpdate?.({
          employeeId: employee.employee_id,
          employeeName: employee.name,
          weekOffData,
          updateLevel,
          apiResponse: response.data
        });
      } else {
        throw new Error(response.data.message || 'Failed to update week off');
      }
    } catch (error) {
      console.error('Error updating week off:', error);
      
      // Create a formatted error object to pass to parent
      const formattedError = {
        message: error.response?.data?.message || error.message || 'Failed to update week off',
        status: error.response?.status,
        data: error.response?.data
      };
      
      // Re-throw the error to let the parent component handle it
      throw formattedError;
    }
  };

  const handleClose = () => {
    setFetchError('');
    onClose?.();
  };

  // Don't render if not shown
  if (!show) return null;

  const isProcessing = isLoading || isFetching;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Set Week Off
                </h3>
                <p className="text-sm text-gray-600">
                  For: <span className="font-medium">{employee?.name}</span>
                </p>
                {fetchError && (
                  <p className="text-sm text-red-600 mt-1">
                    {fetchError} (Using fallback data)
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isFetching && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-700">Loading week off configuration...</span>
                </div>
              </div>
            )}

            {/* Update Level Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Level:
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    checked={updateLevel === 'employee'}
                    onChange={() => setUpdateLevel('employee')}
                    disabled={isProcessing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Employee Level</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    checked={updateLevel === 'team'}
                    onChange={() => setUpdateLevel('team')}
                    disabled={isProcessing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Team Level</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {updateLevel === 'team' 
                  ? 'This will apply to all employees in the same team'
                  : 'This will apply only to this employee'
                }
              </p>
            </div>
            
            {/* Week Off Checkboxes */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Week Off Days:
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(weekOffData).map(([day, isSelected]) => (
                  <label 
                    key={day} 
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => !isProcessing && handleWeekOffChange(day)}
                      disabled={isProcessing}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Days Summary */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                Selected days off:
              </p>
              <p className="text-sm font-medium text-gray-900">
                {Object.entries(weekOffData)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                  .join(', ') || 'No days selected'}
              </p>
            </div>
          </div>
          
          {/* Footer - Using ReusableButton components */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            {/* Update Week Off Button */}
            <ReusableButton
              module="weekoff-config"
              action="update"
              buttonName={
                isProcessing 
                  ? (isFetching ? 'Loading...' : 'Updating...') 
                  : 'Update Week Off'
              }
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center ${
                isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              size={16}
            >
              {isProcessing && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              )}
            </ReusableButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeekOffModal;