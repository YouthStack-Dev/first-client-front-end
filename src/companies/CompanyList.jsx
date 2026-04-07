// src/companies/CompanyList.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, AlertTriangle } from "lucide-react";
import CompanyCard from "./CompanyCard";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";
import {
  selectVendors,
  selectVendorsFetched,
  selectVendorsLoading,
  selectVendorsError,
} from "../redux/features/vendors/vendorSlice";

const CompanyList = ({
  companies = [],
  onEditCompany,
  onAddEmployee,
  onAddRole,
  onAddTeam,
}) => {
  const dispatch = useDispatch();

  const vendors        = useSelector(selectVendors);
  const vendorsFetched = useSelector(selectVendorsFetched);
  const vendorsLoading = useSelector(selectVendorsLoading);
  const vendorsError   = useSelector(selectVendorsError);

  useEffect(() => {
    if (!vendorsFetched) dispatch(fetchVendorsThunk());
  }, [vendorsFetched, dispatch]);

  const stats = useMemo(
    () => ({
      total:    companies.length,
      active:   companies.filter((c) => c.is_active === true).length,
      inactive: companies.filter((c) => c.is_active === false).length,
    }),
    [companies]
  );

  return (
    <div className="space-y-4">

      {/* Vendor fetch error */}
      {vendorsError && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200
          text-yellow-700 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Vendor data could not be loaded. Some card details may be incomplete.
          </span>
        </div>
      )}

      {/* Stats bar */}
      {companies.length > 0 && (
        <div className="grid grid-cols-3 gap-3" role="region" aria-label="Company statistics">
          {[
            { n: stats.total,    label: "Total",    color: "text-slate-800"   },
            { n: stats.active,   label: "Active",   color: "text-emerald-600" },
            { n: stats.inactive, label: "Inactive", color: "text-rose-500"    },
          ].map(({ n, label, color }) => (
            <div key={label} className="bg-white px-4 py-3 rounded-lg border border-slate-200
              flex items-center gap-3">
              <div className={`text-xl font-bold ${color}`}>{n}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Companies grid — 3 per row */}
      {companies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-[14px] font-semibold text-slate-600 mb-1">
            No companies found
          </h3>
          <p className="text-[12px] text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((company, index) => {
            const key = company.tenant_id || company.id;
            if (!key) {
              console.warn(
                "[CompanyList] Company rendered without a stable unique ID:",
                company
              );
            }
            return (
              <CompanyCard
                key={key ?? `fallback-${index}`}
                company={company}
                vendors={vendors}
                vendorsLoading={vendorsLoading}
                vendorsError={vendorsError}
                onEditCompany={onEditCompany}
                onAddEmployee={onAddEmployee}
                onAddRole={onAddRole}
                onAddTeam={onAddTeam}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyList;