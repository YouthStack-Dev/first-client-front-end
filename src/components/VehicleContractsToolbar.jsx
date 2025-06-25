import React, { useState, useEffect } from "react";
import {
  VehicleTableDatadummyData,
  VehicleTableheaders,
} from "../staticData/VehicleTableData";
import DynamicTable from "./DynamicTable";
import CostCenter from "../pages/CostCenter";
import VehicleContractModal from "../components/modals/VehicleContractModal";
import { Upload, Download, Edit, Trash2, Clock } from "lucide-react";

// Sub-component for SHIFT VEHICLE CONTRACTS
const ShiftVehicleContracts = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState(VehicleTableDatadummyData);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const handleOpenModal = () => {
      setSelectedRow(null);
      setShowModal(true);
    };
    window.addEventListener("openAddContractModal", handleOpenModal);
    return () => window.removeEventListener("openAddContractModal", handleOpenModal);
  }, []);

  const totalPages = 1;

  const handleSelectItem = (item, checked) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (checked && !exists) return [...prev, item];
      if (!checked && exists) return prev.filter((i) => i.id !== item.id);
      return prev;
    });
  };

  const handleEdit = (item) => {
    setSelectedRow(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleViewHistory = (item) => {
    console.log("Viewing history for:", item);
    // You can implement a modal or side panel here
  };

  const handleSave = (formData) => {
    if (selectedRow) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRow.id ? { ...item, ...formData } : item
        )
      );
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    setShowModal(false);
    setSelectedRow(null);
  };

  const onNext = () => setCurrentPage((p) => p + 1);
  const onPrev = () => setCurrentPage((p) => p - 1);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.registration
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStartDate = startDate
      ? new Date(item.startDate.split("-").reverse().join("-")) >=
        new Date(startDate)
      : true;
    const matchesEndDate = endDate
      ? new Date(item.startDate.split("-").reverse().join("-")) <=
        new Date(endDate)
      : true;
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const handleDownload = () => {
    const csvRows = [];

    const headers = VehicleTableheaders.map((h) => h.label || h.key);
    csvRows.push(headers.join(","));

    filteredData.forEach((row) => {
      const values = VehicleTableheaders.map((h) => {
        const value = row[h.key] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "shift_vehicle_contracts_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by Vehicle Registration"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="p-2 hover:bg-gray-100 rounded">
            <Upload size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" onClick={handleDownload}>
            <Download size={18} />
          </button>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          />
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        headers={VehicleTableheaders}
        data={filteredData}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectItem={handleSelectItem}
        selectedItems={selectedItems}
        renderActions={(item) => (
          <div className="flex justify-center items-center gap-3">
            <button
              title="Edit"
              className="text-blue-600 hover:bg-gray-100 p-1.5 rounded"
              onClick={() => handleEdit(item)}
            >
              <Edit size={18} />
            </button>
            <button
              title="Delete"
              className="text-red-600 hover:bg-gray-100 p-1.5 rounded"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 size={18} />
            </button>
            <button
              title="History"
              className="text-purple-600 hover:bg-gray-100 p-1.5 rounded"
              onClick={() => handleViewHistory(item)}
            >
              <Clock size={18} />
            </button>
          </div>
        )}
      />

      <VehicleContractModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRow(null);
        }}
        initialData={selectedRow}
        onSave={handleSave}
      />
    </>
  );
};

// Dummy Components
const Contract = () => <div className="text-gray-700">📄 Contract UI</div>;
const AdjustmentPenalty = () => <div className="text-gray-700">⚖️ Adjustment & Penalty UI</div>;
const Tool = () => <div className="text-gray-700">🛠️ Tool UI</div>;

const vehicleContractSubTabs = {
  "SHIFT VEHICLE CONTRACTS": ShiftVehicleContracts,
};

const masterSubTabs = {
  "CONTRACT": Contract,
  "COST CENTER": CostCenter,
};

const billCycleSubTabComponents = {
  "ADJUSTMENT & PENALTY": AdjustmentPenalty,
  "TOOL": Tool,
};

export default function VehicleContract() {
  const mainTabs = ["BILL CYCLE DATA ENTRY", "VEHICLE CONTRACT", "MASTER"];
  const [mainTab, setMainTab] = useState("VEHICLE CONTRACT");
  const [subTab, setSubTab] = useState("SHIFT VEHICLE CONTRACTS");

  const renderSubTabs = () => {
    let subTabs = [];
    if (mainTab === "VEHICLE CONTRACT") {
      subTabs = Object.keys(vehicleContractSubTabs);
    } else if (mainTab === "BILL CYCLE DATA ENTRY") {
      subTabs = Object.keys(billCycleSubTabComponents);
    } else if (mainTab === "MASTER") {
      subTabs = Object.keys(masterSubTabs);
    }

    return (
      <div className="flex justify-between items-center px-6 py-3 bg-white rounded-b-md border-b shadow-sm">
        <div className="flex gap-4">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                subTab === tab
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {mainTab === "VEHICLE CONTRACT" && subTab === "SHIFT VEHICLE CONTRACTS" && (
          <button
            onClick={() => {
              const event = new CustomEvent("openAddContractModal");
              window.dispatchEvent(event);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Add Contract
          </button>
        )}
      </div>
    );
  };

  let ActiveComponent;
  if (mainTab === "VEHICLE CONTRACT") {
    ActiveComponent = vehicleContractSubTabs[subTab];
  } else if (mainTab === "BILL CYCLE DATA ENTRY") {
    ActiveComponent = billCycleSubTabComponents[subTab];
  } else if (mainTab === "MASTER") {
    ActiveComponent = masterSubTabs[subTab];
  }

  return (
    <div className="w-full max-w-[100%] mx-auto mt-6 px-4">
      <div className="flex flex-wrap gap-4 bg-white rounded-md shadow-md px-6 py-4 mb-2">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMainTab(tab);
              if (tab === "VEHICLE CONTRACT") setSubTab("SHIFT VEHICLE CONTRACTS");
              else if (tab === "BILL CYCLE DATA ENTRY") setSubTab("ADJUSTMENT & PENALTY");
              else if (tab === "MASTER") setSubTab("CONTRACT");
            }}
            className={`px-5 py-2 rounded-lg text-sm uppercase tracking-wide font-bold transition ${
              mainTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderSubTabs()}

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="text-gray-500 italic">UI for "{mainTab}" coming soon...</div>
        )}
      </div>
    </div>
  );
}
