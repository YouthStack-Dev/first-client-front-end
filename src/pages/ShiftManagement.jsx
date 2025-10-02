import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import DynamicTable from "@components/DynamicTable";
import { fetchshiftTrunk } from "../redux/features/shift/shiftTrunk";
import Modal from "@components/modals/Modal";
import CategoryForm from "@components/shift/CategoryForm";
import ShiftForm from "@components/shift/ShiftForm";

const ShiftManagement = () => {
  const dispatch = useDispatch();

  const {shifts,loading,error,} = useSelector((state) => state.shift);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorieModal, setShowCategorieModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const shiftCategories=[]

  // Fetch shift data on mount
  useEffect(() => {
    if (!shifts || shifts.length === 0) {
      dispatch(fetchshiftTrunk());
    }
  }, [dispatch, shifts]);

  // Extract categories from shifts data
  const categories = useMemo(() => {
    if (!Array.isArray(shifts)) return [];
    return shifts.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description
    }));
  }, [shifts]);
  

  // Get shifts for selected category
  const shiftsForSelectedCategory = useMemo(() => {
    if (!selectedCategory || !shifts) return [];
    const category = shifts.find(cat => cat.id === selectedCategory);
    return category ? category.shifts : [];
  }, [selectedCategory, shifts]);

  // Handle search/filtering within selected category
  const filteredShifts = useMemo(() => {
    if (!searchTerm) return shiftsForSelectedCategory;
    return shiftsForSelectedCategory.filter((shift) =>
      shift.shiftType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shiftsForSelectedCategory, searchTerm]);

  const onAddClick = () => {
    console.log("Add Shift button clicked");
    // Add shift logic
  };

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
    // Can optionally trigger remote API search
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSelectShift = (shift, isSelected) => {
    setSelectedShifts((prev) =>
      isSelected
        ? [...prev, shift]
        : prev.filter((s) => s.id !== shift.id)
    );
  };

  const handleEditShift = (shift) => {
    console.log("Editing shift:", shift);
    // Edit logic
  };

  const handleDeleteShift = (shift) => {
    console.log("Deleting shift:", shift);
    // Delete logic
  };

  const handleViewHistory = (shift) => {
    console.log("Viewing history for shift:", shift);
    // View history logic
  };
  const headers = useMemo(
    () => [
      { key: "shiftType", label: "Shift Type" },
      {
        key: "time",
        label: "Time",
        render: (item) =>
          `${item.hour.toString().padStart(2, "0")}:${item.minute
            .toString()
            .padStart(2, "0")}`,
      },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              item.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    []
  );

  // Loading State
  if (loading) {
    return <div className="p-4">Loading shifts...</div>;
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error fetching shifts: {error}
      </div>
    );
  }

  return (
    <div>
      <ToolBar
        onAddClick={()=> setShowShiftModal(true)}
        addButtonLabel="New Shift"
        addButtonIcon={<Plus />}
        leftContent={
          <div className="flex items-center space-x-4">
            <div className="w-64">
              
              <select
                id="category-select"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">-- Select a category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategory && (
              <SearchInput
                placeholder="Search by shift type..."
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
              />
            )}
          </div>
        }
        rightContent={
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={()=>setShowCategorieModal(true)}> 
            Add Category
          </button>
        }
        className="p-4 bg-white border rounded shadow-sm"
      />

      {selectedCategory ? (
        <div className="mt-4">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg">
              {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <p className="text-gray-600">
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
          </div>
          
          <DynamicTable
            headers={headers}
            data={filteredShifts}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredShifts.length / 10)}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            onSelectItem={handleSelectShift}
            selectedItems={selectedShifts}
            // onEdit={handleEditShift}
            // onDelete={handleDeleteShift}
            // onHistory={handleViewHistory}
          />
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-500">
          Please select a shift category to view its shifts
        </div>
      )} 


<Modal
  title="Add Category"
  isOpen={showCategorieModal}
  onClose={() => setShowCategorieModal(false)}
>
  <CategoryForm
    onSubmit={(data) => {
      console.log("Submitted category:", data);
      // TODO: dispatch Redux action or API call here
      setShowCategorieModal(false);
    }}
    onCancel={() => setShowCategorieModal(false)}
  />
</Modal>



<Modal
  title="Add Shift"
  isOpen={showShiftModal}
  onClose={() => setShowShiftModal(false)}
>
  <ShiftForm
    categories={shiftCategories} // pass array like [{id: 3, name: "Afternoon Shift"}]
    onSubmit={(data) => {
      console.log("Shift data submitted:", data);
      // TODO: Dispatch Redux action or API call here
      setShowShiftModal(false);
    }}
    onCancel={() => setShowShiftModal(false)}
  />
</Modal>

      
    </div>
  );
};

export default ShiftManagement; 