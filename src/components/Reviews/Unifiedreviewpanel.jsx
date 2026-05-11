// UnifiedReviewPanel.jsx
// Thin root — just mounts the correct tab.
// All logic lives in the individual tab files.

import BookingsTab   from "./BookingsTab";
import DriversTab    from "./DriversTab";
import VehiclesTab   from "./VehiclesTab";
import AllReviewsTab from "./AllReviewsTab";

const UnifiedReviewPanel = ({
  activeTab,
  tenantId,
  isVendorUser,
  vendorId,
  vendorOptions,
}) => (
  <div className="h-full overflow-hidden">
    {activeTab === "bookings"   && <BookingsTab   tenantId={tenantId} />}
    {activeTab === "drivers"    && <DriversTab    isVendorUser={isVendorUser} vendorId={vendorId} vendorOptions={vendorOptions} />}
    {activeTab === "vehicles"   && <VehiclesTab   isVendorUser={isVendorUser} vendorId={vendorId} vendorOptions={vendorOptions} />}
    {activeTab === "allreviews" && <AllReviewsTab />}
  </div>
);

export default UnifiedReviewPanel;