import { useState } from "react";
import VehicleContractModal from "@components/modals/VehicleContractModal";
import VehicleContractsToolbar from "@components/VehicleContractsToolbar";

const VehicleContract = () => {
  const [contractModal, setContractModal] = useState(false);

  return (
    <>
      {/* Only the toolbar and modal remain */}
      <VehicleContractsToolbar />

      <VehicleContractModal
        isOpen={contractModal}
        onClose={() => setContractModal(false)}
      />
    </>
  );
};

export default VehicleContract;
