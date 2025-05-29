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
  const [currentPage, setCurrentPage] = useState(1);
  const [contractModal, setContractModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const totalPages = 1;

  const handleMenuToggle = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleSelectItem = (item, checked) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (checked && !exists) {
        return [...prev, item];
      } else if (!checked && exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return prev;
    });
  };

  const onNext = () => setCurrentPage((p) => p + 1);
  const onPrev = () => setCurrentPage((p) => p - 1);

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
