import SearchInput from "./SearchInput";

const ToolBar = ({
  children,
  className = "",
  onAddClick,
  addButtonLabel = "Add",
  addButtonIcon = null,
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-4 ${className}`}
      {...props}
    >
      {/* Left: Search input */}
      <div className="w-full sm:w-auto flex-1 min-w-[200px] max-w-sm">
        <SearchInput />
      </div>

      {/* Right: Add button + other children */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {addButtonIcon}
          {addButtonLabel}
        </button>
        {children}
      </div>
    </div>
  );
};

export default ToolBar;
