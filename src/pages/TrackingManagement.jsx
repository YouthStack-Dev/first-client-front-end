import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import LiveTracking from "./LiveTracking";
import { API_CLIENT } from "../Api/API_Client";
import { logDebug } from "../utils/logger";
import SelectField from "../components/ui/SelectField";
import { selectCompaniesFetched } from "../redux/features/company/companyslice";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";
import ToolBar from "../components/ui/ToolBar";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

const TrackingManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const fetched = useSelector(selectCompaniesFetched);

  // Get all companies from Redux slice and user type
  const { data: companies, loading: companiesLoading } = useSelector(
    (state) => state.company
  );
  const userType = user?.type || "admin"; // Fallback to admin for testing
  logDebug(" This is the user Type ", userType);
  // Fetch companies if not fetched yet
  useEffect(() => {
    if (userType === "admin" && !fetched && !companiesLoading) {
      dispatch(fetchCompaniesThunk());
      logDebug("Dispatching fetchCompaniesThunk");
    }
  }, [userType, fetched, companiesLoading, dispatch]);

  const fetchOngoingRoutes = async (companyId = null) => {
    setLoading(true);
    setError(null);

    try {
      let url = "/v1/routes/?status=Ongoing";

      // Add company filter if user is admin and company is selected
      if (userType === "admin" && companyId) {
        url += `&tenant_id=${companyId}`;
      }

      const response = await API_CLIENT.get(url);
      logDebug("Ongoing Routes Response:", response.data);

      // Extract routes from API response structure
      if (
        response.data?.success &&
        Array.isArray(response.data?.data?.shifts)
      ) {
        // Extract routes from all shifts
        const allRoutes = response.data.data.shifts.reduce((acc, shift) => {
          if (shift.routes && Array.isArray(shift.routes)) {
            return [...acc, ...shift.routes];
          }
          return acc;
        }, []);

        logDebug(
          `Extracted ${allRoutes.length} routes from ${response.data.data.shifts.length} shifts`
        );
        setRoutes(allRoutes);
      } else {
        // Handle empty response or different structure
        logDebug("No shifts found or different response structure");
        setRoutes([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch ongoing routes");
      logDebug("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    if (companyId) {
      fetchOngoingRoutes(companyId);
    } else {
      // If "All companies" is selected, fetch routes without company filter
      fetchOngoingRoutes();
    }
  };

  // Fetch initial routes when component mounts
  useEffect(() => {
    if (userType !== "admin") {
      // Non-admin users see all ongoing routes
      fetchOngoingRoutes();
    }
    // For admin users, wait for company selection
  }, [userType]);

  // Get selected company object for display
  const getSelectedCompany = () => {
    if (!selectedCompanyId) return null;
    return (
      companies.find((company) => company.tenant_id === selectedCompanyId) ||
      null
    );
  };

  // Prepare company options for select field - show loading or empty if companies not loaded
  const companyOptions = [
    { value: "", label: "All Companies" },
    ...companies.map((company) => ({
      value: company.tenant_id,
      label: company.name || `Company ${company.tenant_id}`,
    })),
  ];

  // Show loading state for companies
  const isLoadingCompanies =
    companiesLoading || (!fetched && companies.length === 0);

  return (
    <div className="p-2">
      <ToolBar
        rightElements={
          <div className="flex items-center gap-3">
            {userType === "admin" ? (
              <SelectField
                label="Select Company"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                options={isLoadingCompanies ? [] : companyOptions}
                isLoading={isLoadingCompanies}
                placeholder={
                  isLoadingCompanies
                    ? "Loading companies..."
                    : "Select a company..."
                }
                disabled={isLoadingCompanies}
              />
            ) : null}

            <button
              onClick={() => fetchOngoingRoutes(selectedCompanyId || null)}
              disabled={loading || (userType === "admin" && isLoadingCompanies)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                "Refresh Routes"
              )}
            </button>
          </div>
        }
      />

      {/* Live Tracking Component */}
      <LiveTracking
        routes={routes}
        loading={loading || (userType === "admin" && isLoadingCompanies)}
        userType={userType}
        selectedCompany={getSelectedCompany()}
      />
    </div>
  );
};

export default TrackingManagement;
