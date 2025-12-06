/**
 * Search-related helper functions
 */

// Name: only letters and spaces, no digits/special chars
export const isName = (term) => {
  const trimmed = term.trim();
  if (!trimmed) return false;

  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(trimmed);
};

// Email: treat anything containing '@' as email
export const isEmail = (term) => {
  const trimmed = term.trim();
  if (!trimmed) return false;

  return trimmed.includes("@");
};

// Phone: all digits only
export const isPhoneNumber = (term) => {
  const trimmed = term.trim();
  if (!trimmed) return false;

  const digitsOnlyRegex = /^\d+$/;
  return digitsOnlyRegex.test(trimmed);
};

// Build params for name/phone/email in a single place
export const buildSearchParams = (search) => {
  const trimmed = search.trim();

  if (!trimmed) {
    return { name: undefined, phone: undefined, email: undefined };
  }

  // 1. If it has '@' -> email search
  if (isEmail(trimmed)) {
    return {
      name: undefined,
      phone: undefined,
      email: trimmed,
    };
  }

  // 2. If only letters + spaces -> name search
  if (isName(trimmed)) {
    return {
      name: trimmed,
      phone: undefined,
      email: undefined,
    };
  }

  // 3. If only digits -> phone search
  if (isPhoneNumber(trimmed)) {
    return {
      name: undefined,
      phone: parseInt(trimmed, 10), // Convert to NUMBER
      email: undefined,
    };
  }

  // 4. Fallback: treat as name (or you can return all undefined)
  return {
    name: trimmed,
    phone: undefined,
    email: undefined,
  };
};

// Get search placeholder based on search term
export const getSearchPlaceholder = (searchTerm) => {
  if (!searchTerm) {
    return "Search by name, email, or phone...";
  }

  if (isEmail(searchTerm)) {
    return "Searching by email...";
  }

  if (isName(searchTerm)) {
    return "Searching by name...";
  }

  if (isPhoneNumber(searchTerm)) {
    return "Searching by phone number...";
  }

  return "Searching...";
};

/**
 * Helper functions for handling API responses
 */

/**
 * Extract data and total count from various API response structures
 * @param {Object} response - API response
 * @returns {Object} { data: Array, total: Number }
 */
export const extractDataFromResponse = (response) => {
  let data = [];
  let total = 0;

  if (!response || !response.data) {
    return { data, total };
  }

  const responseData = response.data;

  // Handle different response structures
  if (responseData.data?.items) {
    // Structure: { data: { data: { items: [], total: X } } }
    data = responseData.data.items;
    total = responseData.data.total || responseData.total || data.length;
  } else if (responseData.items) {
    // Structure: { data: { items: [], total: X } }
    data = responseData.items;
    total = responseData.total || data.length;
  } else if (Array.isArray(responseData)) {
    // Structure: { data: [] }
    data = responseData;
    total = responseData.length;
  } else if (responseData.data) {
    // Structure: { data: { data: [] } }
    data = Array.isArray(responseData.data) ? responseData.data : [];
    total = responseData.total || data.length;
  }

  return { data, total };
};

/**
 * Handle API errors with toast notifications
 * @param {Error} error - Error object
 * @param {Function} toast - Toast function
 * @returns {Object} { data: [], total: 0 }
 */
export const handleApiError = (error, toast) => {
  console.error("API Error:", error);
  console.error("Error details:", error.response?.data);

  if (error.response?.status === 404) {
    toast?.error("No data found");
    return { data: [], total: 0 };
  } else if (error.response?.status === 400) {
    toast?.error("Invalid search parameters");
    return { data: [], total: 0 };
  } else {
    toast?.error(
      error.response?.data?.message || "Failed to fetch data. Please try again."
    );
    return { data: [], total: 0 };
  }
};
