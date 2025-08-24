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
import Routing from "../components/RouteManagement/Routing";
import ScheduledBookings from "../components/RouteManagement/ScheduledBookings";
import ScheduleOfficeBookings from "../components/RouteManagement/ScheduleOfficeBookings"; // new component for picking date

const RouteManagement = () => {
  const [toggle, setToggle] = useState("date");
  const [selectedDate, setSelectedDate] = useState(null);
  const [routingData, setRoutingData] = useState([]);

  return (
    <div className="p-4">
      {toggle === "date" && (
        <ScheduleOfficeBookings
          setSelectedDate={setSelectedDate}
          toggleRouting={setToggle}
        />
      )}
      {toggle === "booking" && (
        <ScheduledBookings
          toggleRouting={setToggle}
          setRoutingData={setRoutingData}
          selectedDate={selectedDate}
        />
      )}
      {toggle === "routing" && (
        <Routing toggleRouting={setToggle} routingData={routingData} />
      )}
    </div>
  );
};

export default RouteManagement;
