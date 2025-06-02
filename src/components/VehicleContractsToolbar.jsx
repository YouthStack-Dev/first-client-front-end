import React, { useState } from "react";
import { VehicleTableDatadummyData, VehicleTableheaders } from "../staticData/VehicleTableData";
import DynamicTable from "./DynamicTable";

// Sub-components (you can also import from other files)
const ShiftVehicleContracts = () =>{
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
  const onPrev = () => setCurrentPage((p) => p - 1);

    return  <DynamicTable
    headers={VehicleTableheaders}
    data={VehicleTableDatadummyData}
    menuOpen={menuOpen}
    onMenuToggle={handleMenuToggle}
    onNext={onNext}
    onPrev={onPrev}
    currentPage={currentPage}
    totalPages={totalPages}
    onSelectItem={handleSelectItem}
    selectedItems={selectedItems}
  />
}




const Contract = () => <div>📄 Contract UI</div>;
const ContractSwitchMapping = () => <div>🔄 Contract Switch Mapping UI</div>;
const BillingZone = () => <div>🌍 Billing Zone UI</div>;
const CostCenter = () => <div>🏢 Cost Center UI</div>;
const AutoPenalty = () => <div>⚠️ Auto Penalty UI</div>;
const FuelType = () => <div>⛽ Fuel Type UI</div>;

const subTabComponents = {
  "SHIFT VEHICLE CONTRACTS": ShiftVehicleContracts,
  CONTRACT: Contract,
  "CONTRACT SWITCH MAPPING": ContractSwitchMapping,
  "BILLING ZONE": BillingZone,
  "COST CENTER": CostCenter,
  "AUTO PENALTY": AutoPenalty,
  "FUEL TYPE": FuelType,
};

const BillingTemplate = () => <div>🧾 Billing Template UI</div>;
const BillingHistory = () => <div>📚 Billing History UI</div>;

const billCycleSubTabComponents = {
  "BILLING TEMPLATE": BillingTemplate,
  "BILLING HISTORY": BillingHistory,
};


export default function VehicleContractTabs() {
  const mainTabs = ["BILL CYCLE DATA ENTRY", "VEHICLE CONTRACT", "MASTER"];
  const vehicleSubTabs = Object.keys(subTabComponents); // give an array of the keys of objects 
  console.log( " type of ",`${typeof vehicleSubTabs}`);

  const [mainTab, setMainTab] = useState("VEHICLE CONTRACT");
  const [subTab, setSubTab] = useState("SHIFT VEHICLE CONTRACTS");

  const renderSubTabs = () => {
    let subTabs = [];
    if (mainTab === "VEHICLE CONTRACT") {
      subTabs = vehicleSubTabs;
    } else if (mainTab === "BILL CYCLE DATA ENTRY") {
      subTabs = Object.keys(billCycleSubTabComponents);
    }
  
    return (
      <div className="flex space-x-6 border-b border-gray-200 px-4">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`pb-2 text-sm font-semibold uppercase ${
              subTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };
  
  const ActiveComponent = subTabComponents[subTab];

  return (
    <div className="w-full">
      {/* Main Tabs */}
      <div className="flex space-x-6 border-b border-gray-300 px-4">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMainTab(tab);
              if (tab === "VEHICLE CONTRACT") {
                setSubTab("SHIFT VEHICLE CONTRACTS");
              } else {
                setSubTab("");
              }
            }}
            className={`py-3 text-base font-bold uppercase tracking-wide ${
              mainTab === tab
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-black hover:text-blue-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      {renderSubTabs()}

      {/* Dynamic Component Content */}
      <div className="p-4">
        {mainTab === "VEHICLE CONTRACT" && ActiveComponent && (
          <ActiveComponent />
        )}
        {mainTab !== "VEHICLE CONTRACT" && (
          <div className="text-gray-500 italic">
            UI for "{mainTab}" coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
