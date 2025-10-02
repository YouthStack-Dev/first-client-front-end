import { useEffect, useState } from "react";
import ShiftManagement from "@components/Schedulemanagement/ShiftManagement";
import ShiftCategoryManagement from "@components/Schedulemanagement/ShiftCategoryManagement";
import { useDispatch } from "react-redux";
import { API_CLIENT } from "../Api/API_Client";
import { logDebug } from "../utils/logger";
import { setShifts } from "../redux/features/shift/shiftSlice";

const Schedulemanagement =()=>{
  const [activeTab, setActiveTab] = useState("shift"); 

  // const [shifts, setShifts] = useState([]);
const dispatch = useDispatch();
  const fetchcompanyShifts = async() => {

    const response = await API_CLIENT.get('api/shifts/get-shifts');
    logDebug("Fetched Shifts:", response.data);
    dispatch(setShifts(response.data.shifts));
  };


  useEffect(()=>{
    fetchcompanyShifts()
  },[])



    return(
        <div>
      {/* Top Navigation */}
      <div className="flex  border-b p-1">
        <button
          className={`px-4 py-2 ${activeTab === "shift" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("shift")}
        >
          ShiftManagement
         
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "shiftCategory" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("shiftCategory")}
        >
         ShiftCategoryManagement
        </button>
      </div>

      {/* Conditional Component Rendering */}
      <div className="p-1">
        {activeTab === "shift" && <ShiftManagement />}
        {activeTab === "shiftCategory" && <ShiftCategoryManagement />}

      </div>
    </div>
    )
}

export default Schedulemanagement