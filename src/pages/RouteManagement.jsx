

import { useState } from "react";
import Routing from "../components/RouteManagement/Routing";
import ScheduledBookings from "../components/RouteManagement/ScheduledBookings";
  const RouteManagement = () => {
  const [toggle, setToggle] = useState("booking");
  const [selectedDate, setSelectedDate] = useState(null);
  const [routingData, setRoutingData] = useState([]);

  return (
    <div >
   
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
