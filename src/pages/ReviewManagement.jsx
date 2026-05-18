import { useState }         from "react";
import { useSelector }      from "react-redux";
import { ClipboardList, Users, Car, Search } from "lucide-react";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions }  from "../hooks/useVendorOptions";
import UnifiedReviewPanel    from "../components/Reviews/Unifiedreviewpanel";

const TABS = [
  { id: "bookings",   label: "Bookings",    Icon: ClipboardList },
  { id: "drivers",    label: "Drivers",     Icon: Users         },  // ← was UserCog
  { id: "vehicles",   label: "Vehicles",    Icon: Car           },
  { id: "allreviews", label: "All Reviews", Icon: Search        },
];

const ReviewManagement = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  const user         = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";
  const vendorId     = user?.vendor_user?.vendor_id;
  const tenantId     =
    user?.employee?.tenant_id ||
    user?.vendor_user?.tenant_id ||
    user?.tenant_id;

  const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 flex-shrink-0">
        <div
          className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Review tabs"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`review-tabpanel-${id}`}
              id={`review-tab-${id}`}
              className={`inline-flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap
                ${activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              {label}
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