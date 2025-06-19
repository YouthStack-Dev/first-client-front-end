import { useState } from "react";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute"
import AddVendorModal from "../components/modals/AddVendorModal";
import DynamicTable from "../components/DynamicTable";
import { vendorTableData, vendorTableHeaders } from "../staticData/vendorTableData";

const ManageVendor = (second) => {

  const [selectedItems, setSelectedItems] = useState([]);
  const totalPages = 1;
  const [menuOpen, setMenuOpen] = useState(null);
  const handleMenuToggle = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  const [currentPage, setCurrentPage] = useState(1);
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
const onPrev = () => setCurrentPage((p) => p - 1)
    const [VendorModal, setVendorModal] = useState(false);
    return(

        <div>
                <HeaderWithActionNoRoute
        title="ManageVendor "
        buttonLabel="Add "
        onButtonClick={() => setVendorModal(true)}
        showBackButton={false}
      />
<AddVendorModal
        isOpen={VendorModal}
        onClose={() => setVendorModal(false)}
    
      />
      <DynamicTable
    headers={vendorTableHeaders}
    data={vendorTableData}
    menuOpen={menuOpen}
    onMenuToggle={handleMenuToggle}
    onNext={onNext}
    onPrev={onPrev}
    currentPage={currentPage}
    totalPages={totalPages}
    onSelectItem={handleSelectItem}
    selectedItems={selectedItems}
  />
        </div>
    )
     }

export default ManageVendor