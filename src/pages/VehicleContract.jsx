import { useState } from "react";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
import VehicleContractModal from "../components/modals/VehicleContractModal";
import DynamicTable from "../components/DynamicTable";
import {
  VehicleTableDatadummyData,
  VehicleTableheaders,
} from "../staticData/VehicleTableData";
import VehicleContractsToolbar from "../components/VehicleContractsToolbar";

const VehicleContract = () => {
  const [menuOpen, setMenuOpen] = useState(null);

  const [contractModal, setContractModal] = useState(false);
  


  return (
    <>
      <HeaderWithActionNoRoute
        title="Vehicle Contracts"
        buttonLabel="Add Contract"
        onButtonClick={() => setContractModal(true)}
        showBackButton={false}
      />
<VehicleContractsToolbar/>
      <VehicleContractModal
        isOpen={contractModal}
        onClose={() => setContractModal(false)}
      />

    
    </>
  );
};

export default VehicleContract;
