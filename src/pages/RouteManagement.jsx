// import { useState } from "react";
// import Routing from "./Routing";
// import ScheduledBookings from "./ScheduledBookings";

// const RouteManagement = () => {
//   const [toggle, setToggle] = useState(false);
//   const [routingData, setRoutingData] = useState([]);
//   return (
//     <div className="">
//       <div>
//         {/* Keep ScheduledBookings always mounted */}
//         <ScheduledBookings toogleRouting={setToggle} isVisible={!toggle} setRoutingData={setRoutingData} />
//       </div>
      
//       {/* Only toggle Routing visibility */}
//       {toggle && <Routing toogleRouting={setToggle} routingData={routingData} />}
//     </div>
//   );
// };

// export default RouteManagement;



import { useState } from "react";
import Routing from "./Routing";
import ScheduledBookings from "./ScheduledBookings";
import ScheduleOfficeBooking from "./ScheduleOfficeBookings";

const RouteManagement = () => {
  const [toggle, setToggle] = useState("office"); 
  const [routingData, setRoutingData] = useState([]);
  const [officeData, setOfficeData] = useState(null);

  return (
    <div className="">
      {/* Step 1: Office Booking */}
      <div className={toggle !== "office" ? "hidden" : ""}>
        <ScheduleOfficeBooking 
          toogleRouting={setToggle} 
          setOfficeData={setOfficeData}  
        />
      </div>

      {/* Step 2: Scheduled Bookings */}
      <div className={toggle !== "booking" ? "hidden" : ""}>
        <ScheduledBookings 
          toogleRouting={setToggle} 
          setRoutingData={setRoutingData} 
          officeData={officeData}   
        />
      </div>

      {/* Step 3: Routing */}
            <div className={toggle !== "routing" ? "hidden" : ""}>
              <Routing 
                toogleRouting={setToggle} 
                routingData={routingData} 
              />
            </div>
    </div>
  );
};

export default RouteManagement;
