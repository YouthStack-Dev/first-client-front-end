import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNodalPointsThunk,
  createNodalPointThunk,
  updateNodalPointThunk,
  deleteNodalPointThunk,
} from "../redux/features/nodalPoints/NodalPointsThunk";

import {
  selectNodalPointsLoading,
  selectNodalPointsError,
  selectNodalPointsCurrentPage,
  selectNodalPointsTotalPages,
  selectNodalPointsTotal,
  selectActiveNodalPointsCount,
  selectInactiveNodalPointsCount,
} from "../redux/features/nodalPoints/Nodalpointsselectors";

import {
  selectAllNodalPoints,
  clearError,
} from "../redux/features/nodalPoints/NodalPointsSlice";

import { selectCurrentUser } from "../redux/features/auth/authSlice";

import NodalPointCard from "../components/Nodal/Nodalpointcard";
import NodalPointForm from "../components/Nodal/Nodalpointform";
import Modal from "../components/modals/Modal";

export default function NodalPointsPage() {
  const dispatch = useDispatch();

  const currentUser  = useSelector(selectCurrentUser);
  const tenantId     = currentUser?.tenant_id;

  const hubs         = useSelector(selectAllNodalPoints);
  const loading      = useSelector(selectNodalPointsLoading);
  const error        = useSelector(selectNodalPointsError);
  const currentPage  = useSelector(selectNodalPointsCurrentPage);
  const totalPages   = useSelector(selectNodalPointsTotalPages);
  const total        = useSelector(selectNodalPointsTotal);
  const activeCount  = useSelector(selectActiveNodalPointsCount);
  const inactiveCount = useSelector(selectInactiveNodalPointsCount);

  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [nameSearch, setNameSearch]         = useState("");
  const [page, setPage]                     = useState(1);
  const [showCreate, setShowCreate]         = useState(false);
  const [showEdit, setShowEdit]             = useState(false);
  const [editHub, setEditHub]               = useState(null);

  useEffect(() => {
    const params = { tenant_id: tenantId, page, per_page: 20 };
    if (isActiveFilter !== "") params.is_active = isActiveFilter === "true";
    dispatch(fetchNodalPointsThunk(params));
    return () => { dispatch(clearError()); };
  }, [dispatch, tenantId, page, isActiveFilter]);

  const handleCreate = async (payload) => {
    const result = await dispatch(createNodalPointThunk(payload));
    if (!result.error) setShowCreate(false);
  };

  const handleUpdate = (nodalPointId, nodalPointData) =>
    dispatch(updateNodalPointThunk({ nodalPointId, tenantId, nodalPointData }));

  const handleDelete = (nodalPointId) =>
    dispatch(deleteNodalPointThunk({ nodalPointId, tenantId }));

  const openEdit = (hub) => { setEditHub(hub); setShowEdit(true); };

  const handleEditSave = async (payload) => {
    if (!editHub) return;
    const result = await dispatch(
      updateNodalPointThunk({
        nodalPointId: editHub.nodal_point_id,
        tenantId,
        nodalPointData: payload,
      })
    );
    if (!result?.error) setShowEdit(false);
    return result;
  };

  // ✅ Fixed: applies both name search AND status filter client-side
  const visibleHubs = hubs.filter((h) => {
    const matchesName = nameSearch.trim()
      ? h.name.toLowerCase().includes(nameSearch.toLowerCase())
      : true;
    const matchesStatus =
      isActiveFilter !== "" ? h.is_active === (isActiveFilter === "true") : true;
    return matchesName && matchesStatus;
  });

  const stats = [
    {
      label: "Total nodals",
      value: total,
      valueColor: "text-slate-900",
      iconBg: "bg-slate-100",
      icon: "ti-map-pin",
      iconColor: "text-slate-500",
    },
    {
      label: "Active",
      value: activeCount,
      valueColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      icon: "ti-circle-check",
      iconColor: "text-emerald-500",
    },
    {
      label: "Inactive",
      value: inactiveCount,
      valueColor: "text-red-500",
      iconBg: "bg-red-50",
      icon: "ti-circle-x",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-full w-full mx-auto px-6 py-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <h3 className={`text-3xl font-semibold mt-1.5 ${item.valueColor}`}>
                    {item.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  <i className={`ti ${item.icon} text-lg ${item.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar: search + filter + count + new button ── */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Search nodal points..."
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={isActiveFilter}
            onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Count pill */}
          <span className="text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 whitespace-nowrap">
            {visibleHubs.length} point{visibleHubs.length !== 1 ? "s" : ""}
          </span>

          {/* New button */}
          <button
            onClick={() => { setShowCreate(true); dispatch(clearError()); }}
            className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition whitespace-nowrap"
          >
            <i className="ti ti-plus text-sm" />
            New nodal point
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-white animate-pulse" />
            ))}
          </div>
        ) : visibleHubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <i className="ti ti-map-pin text-xl text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700">No nodal points found</h3>
            <p className="text-xs text-slate-400 mt-1">Create your first nodal point to get started.</p>
            <button
              onClick={() => { setShowCreate(true); dispatch(clearError()); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <i className="ti ti-plus text-sm" /> New nodal point
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleHubs.map((hub) => (
              <NodalPointCard
                key={hub.nodal_point_id}
                hub={hub}
                tenantId={tenantId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* ── Create Modal ── */}
        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create Nodal Point"
          size="lg"
        >
          <NodalPointForm
            mode="create"
            tenantId={tenantId}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>

        {/* ── Edit Modal ── */}
        <Modal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          title="Edit Nodal Point"
          size="lg"
        >
          {editHub && (
            <NodalPointForm
              mode="edit"
              initial={editHub}
              tenantId={tenantId}
              onSave={handleEditSave}
              onCancel={() => setShowEdit(false)}
            />
          )}
        </Modal>

      </div>
    </div>
  );
}