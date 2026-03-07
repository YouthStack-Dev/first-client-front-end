import { useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions }  from "../hooks/useVendorOptions";
import ToolBar               from "../components/ui/ToolBar";
import UnifiedReviewPanel    from "../components/Reviews/Unifiedreviewpanel";

const TABS = [
  { id: "bookings",   label: "📋 Bookings"    },
  { id: "drivers",    label: "👨‍✈️ Drivers"   },
  { id: "vehicles",   label: "🚗 Vehicles"    },
  { id: "allreviews", label: "🔍 All Reviews" },
];

const ReviewManagement = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  // ── User context ──────────────────────────────────────────────────────────
  const user         = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";
  const vendorId     = user?.vendor_user?.vendor_id;
  const tenantId     =
    user?.employee?.tenant_id ||
    user?.vendor_user?.tenant_id ||
    user?.tenant_id;

  const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Toolbar ── */}
      <ToolBar
        title="Review Management"
        subtitle="Monitor driver and vehicle feedback across all bookings"
        module="review"
      />

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 flex-shrink-0">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Review tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`review-tabpanel-${t.id}`}
              id={`review-tab-${t.id}`}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap
                ${activeTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div
        className="flex-1 overflow-hidden"
        role="tabpanel"
        id={`review-tabpanel-${activeTab}`}
        aria-labelledby={`review-tab-${activeTab}`}
      >
        <UnifiedReviewPanel
          activeTab={activeTab}
          tenantId={tenantId}
          isVendorUser={isVendorUser}
          vendorId={vendorId}
          vendorOptions={vendorOptions}
        />
      </div>

    </div>
  );
};

export default ReviewManagement;
