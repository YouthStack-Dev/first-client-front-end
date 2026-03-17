import { API_CLIENT } from "../../../Api/API_Client";

const PERMISSIONS_BASE = "/iam/permissions/";
const PAGE_LIMIT = 100;

/**
 * GET paginated permissions
 * GET /api/v1/iam/permissions/?skip=0&limit=100
 */
export const fetchIamPermissionsPageApi = (skip = 0, limit = PAGE_LIMIT) =>
  API_CLIENT.get(PERMISSIONS_BASE, { params: { skip, limit } });

/**
 * Fetches ALL permissions across all pages automatically
 * Handles pagination since total can exceed 100 (currently 111+)
 */
export const fetchAllPermissionsApi = async () => {
  // First page — also gives us `total` so we know how many pages remain
  const firstResponse = await fetchIamPermissionsPageApi(0, PAGE_LIMIT);
  const { items, total } = firstResponse.data.data;

  let allItems = [...items];

  // If there are more pages, fetch them in parallel
  if (total > PAGE_LIMIT) {
    const remainingSkips = [];
    for (let skip = PAGE_LIMIT; skip < total; skip += PAGE_LIMIT) {
      remainingSkips.push(skip);
    }

    const remainingResponses = await Promise.all(
      remainingSkips.map((skip) => fetchIamPermissionsPageApi(skip, PAGE_LIMIT))
    );

    remainingResponses.forEach((res) => {
      allItems = [...allItems, ...res.data.data.items];
    });
  }

  return allItems;
};

/**
 * GET single permission by ID
 * GET /api/v1/iam/permissions/:permission_id
 */
export const fetchPermissionByIdApi = (permissionId) =>
  API_CLIENT.get(`${PERMISSIONS_BASE}${permissionId}`);

/**
 * POST create new permission
 * POST /api/v1/iam/permissions/
 * @param {{ module: string, action: string, description: string | null, is_active: boolean }} payload
 */
export const createPermissionApi = (payload) =>
  API_CLIENT.post(PERMISSIONS_BASE, payload);

/**
 * PUT update existing permission
 * PUT /api/v1/iam/permissions/:permission_id
 * @param {number} permissionId
 * @param {{ module: string, action: string, description: string | null, is_active: boolean }} payload
 */
export const updatePermissionApi = (permissionId, payload) =>
  API_CLIENT.put(`${PERMISSIONS_BASE}${permissionId}`, payload);

/**
 * DELETE permission by ID
 * DELETE /api/v1/iam/permissions/:permission_id
 */
export const deletePermissionApi = (permissionId) =>
  API_CLIENT.delete(`${PERMISSIONS_BASE}${permissionId}`);