import Routing from "./Routing";
import ScheduledBookings from "./ScheduledBookings";


const RouteManagement = () => {


  return (
    <div className="">
   {false? <Routing/>:
   
   <ScheduledBookings/>

   } 
    </div>
  );
};

export default RouteManagement;
