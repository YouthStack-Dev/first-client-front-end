import { User, Mail, Phone, MapPin, UserCircle, Calendar, History, Smartphone } from 'lucide-react';
import ReusableButton from './ui/ReusableButton';

const ProfileCard = ({ 
  name, 
  email, 
  phone, 
  employee_code, 
  alternate_phone, 
  gender, 
  address, 
  onBookShift,
  onViewBookingHistory 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4  h-fit sticky top-6">
      {/* Header without photo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <UserCircle className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <p className="text-xs text-gray-500">{employee_code}</p><span> </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800 truncate">{email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800">{phone}</p>
          </div>
        </div>

        {alternate_phone && (
          <div className="flex items-start gap-3">
            <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">{alternate_phone}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800">{gender}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">{address}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <ReusableButton
          module="booking"
          action="create"
          icon={Calendar}
          buttonName="Book Shift"
          onClick={onBookShift}
          className="w-full justify-center py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
          size={16}
        />
        
        <ReusableButton
          module="booking"
          action="read"
          icon={History}
          buttonName="Booking History"
          onClick={onViewBookingHistory}
          className="w-full justify-center py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors text-sm"
          size={16}
        />
      </div>
    </div>
  );
}

export default ProfileCard;