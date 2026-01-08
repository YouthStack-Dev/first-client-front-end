export const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#9ca3af",
    },
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "#f3f4f6"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#374151",
    "&:hover": {
      backgroundColor: "#e5e7eb",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};
