import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

import {
  fetchNodalPointsThunk,
  createNodalPointThunk,
  updateNodalPointThunk,
  deleteNodalPointThunk,
} from "../redux/features/nodalPoints/nodalPointsThunks";
import {
  nodalPointSelectors,
  selectNodalPointsLoading,
  selectNodalPointsError,
} from "../redux/features/nodalPoints/nodalPointsSlice";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import NodalPointTable from "../components/nodalPoints/NodalPointTable";
import NodalPointFormModal from "../components/nodalPoints/NodalPointFormModal";
import EmployeeAssignmentTab from "../components/nodalPoints/EmployeeAssignmentTab";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "hubs", label: "Nodal Points" },
  { key: "assignments", label: "Employee Assignments" },
];

const INITIAL_FORM = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  is_active: true,
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const NodalPointManagement = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const nodalPoints = useSelector(nodalPointSelectors.selectAll);
  const loading = useSelector(selectNodalPointsLoading);
  const serverError = useSelector(selectNodalPointsError);

  // The tenant_id comes from the logged-in company user
  const tenantId = currentUser?.tenant_id;

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("activeNodalTab") || "hubs"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    point: null,
  });

  const hasFetched = useRef(false);

  // ─── Persist active tab ──────────────────────────────────────────────────
  useEffect(() => {
    sessionStorage.setItem("activeNodalTab", activeTab);
  }, [activeTab]);

  // ─── Initial data fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;
    if (hasFetched.current && nodalPoints.length > 0) return;
    hasFetched.current = true;
    dispatch(fetchNodalPointsThunk({ tenant_id: tenantId }));
  }, [dispatch, tenantId]);

  // ─── Filtered nodal points ───────────────────────────────────────────────
  const filteredPoints = nodalPoints.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  // ─── Form validation ─────────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = "Hub name is required";
    else if (formData.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (formData.latitude === "" || formData.latitude === undefined)
      errs.latitude = "Latitude is required";
    else if (isNaN(lat) || lat < -90 || lat > 90)
      errs.latitude = "Latitude must be between -90 and 90";

    if (formData.longitude === "" || formData.longitude === undefined)
      errs.longitude = "Longitude is required";
    else if (isNaN(lng) || lng < -180 || lng > 180)
      errs.longitude = "Longitude must be between -180 and 180";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleCreate = () => {
    setModalMode("create");
    setSelectedPoint(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (point) => {
    setModalMode("edit");
    setSelectedPoint(point);
    setFormData({
      name: point.name,
      address: point.address || "",
      latitude: point.latitude,
      longitude: point.longitude,
      is_active: point.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (point) => {
    setDeleteConfirm({ open: true, point });
  };

  const confirmDelete = async () => {
    const point = deleteConfirm.point;
    setDeleteConfirm({ open: false, point: null });
    try {
      await dispatch(
        deleteNodalPointThunk({ id: point.nodal_point_id, tenant_id: tenantId })
      ).unwrap();
      toast.success(`"${point.name}" deactivated successfully`);
    } catch (err) {
      toast.error(err?.message || "Failed to deactivate nodal point");
    }
  };

  const handleToggleActive = (point) => {
    // Reuse updateNodalPointThunk to toggle is_active
    dispatch(
      updateNodalPointThunk({
        id: point.nodal_point_id,
        tenant_id: tenantId,
        data: { is_active: !point.is_active },
      })
    )
      .unwrap()
      .then(() => {
        toast.success(
          `"${point.name}" ${point.is_active ? "deactivated" : "activated"}`
        );
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to update status");
      });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address?.trim() || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (modalMode === "create") {
        payload.tenant_id = tenantId;
        await dispatch(createNodalPointThunk(payload)).unwrap();
        toast.success("Nodal point created successfully!");
      } else {
        if (formData.is_active !== undefined)
          payload.is_active = formData.is_active;
        await dispatch(
          updateNodalPointThunk({
            id: selectedPoint.nodal_point_id,
            tenant_id: tenantId,
            data: payload,
          })
        ).unwrap();
        toast.success("Nodal point updated successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save nodal point");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <ToolBar
        module="nodal_point"
        onAddClick={activeTab === "hubs" ? handleCreate : undefined}
        addButtonLabel="Nodal Point"
        searchBar={
          activeTab === "hubs" ? (
            <SearchInput
              placeholder="Search by name or address…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          ) : null
        }
        leftElements={
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Total Hubs</span>
            <span className="text-sm font-bold text-gray-800">
              {nodalPoints.length}
            </span>
          </div>
        }
        className="bg-white rounded-lg shadow-sm mb-4"
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="relative flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === "hubs" && (
        <NodalPointTable
          nodalPoints={filteredPoints}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {activeTab === "assignments" && (
        <EmployeeAssignmentTab tenantId={tenantId} />
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <NodalPointFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        formData={formData}
        errors={{ ...formErrors, server: serverError }}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* ── Soft-delete confirmation ──────────────────────────────────────── */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-80 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 text-base mb-1">
              Deactivate nodal point?
            </p>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium">{deleteConfirm.point?.name}</span>{" "}
              will be deactivated. Existing bookings and assignments are
              preserved.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm({ open: false, point: null })}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodalPointManagement;
