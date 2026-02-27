import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all permissions with automatic pagination handling
 * Handles the backend limit of 100 items per request
 */
export const fetchPermissionsApi = async () => {
  const limit = 100;
  
  try {
    // First request to get total count and initial items
    const firstResponse = await API_CLIENT.get(`/iam/permissions/?skip=0&limit=${limit}`);
    
    if (!firstResponse.data.success) {
      throw new Error(firstResponse.data.message || 'Failed to fetch permissions');
    }

    const { total, items } = firstResponse.data.data;
    
    // If we got all items in the first call, return immediately
    if (items.length >= total) {
      return firstResponse.data;
    }

    // Calculate how many additional pages we need to fetch
    const remainingPages = Math.ceil((total - items.length) / limit);
    
    // Create array of promises for parallel fetching
    const pagePromises = Array.from({ length: remainingPages }, (_, index) => {
      const skip = (index + 1) * limit;
      return API_CLIENT.get(`/iam/permissions/?skip=${skip}&limit=${limit}`)
        .catch(err => {
          console.error(`Failed to fetch permissions page at skip=${skip}:`, err);
          // Return empty result on error instead of breaking the entire fetch
          return { data: { success: false, data: { items: [] } } };
        });
    });

    // Fetch all remaining pages in parallel
    const responses = await Promise.all(pagePromises);
    
    // Combine all items from all successful responses
    const allItems = [
      ...items,
      ...responses
        .filter(res => res.data.success)
        .flatMap(res => res.data.data.items)
    ];

    return {
      success: true,
      data: {
        total,
        items: allItems
      }
    };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

