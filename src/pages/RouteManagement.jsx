import { useState } from "react";
import Routing from "./Routing";
import ScheduledBookings from "./ScheduledBookings";

const RouteManagement = () => {
  const [toggle, setToggle] = useState(false);
  const [routingData, setRoutingData] = useState([]);
  return (
    <div className="">
      <div>
        {/* Keep ScheduledBookings always mounted */}
        <ScheduledBookings toogleRouting={setToggle} isVisible={!toggle} setRoutingData={setRoutingData} />
      </div>
      
      {/* Only toggle Routing visibility */}
      {toggle && <Routing toogleRouting={setToggle} routingData={routingData} />}
    </div>
  );
};

export default RouteManagement;
