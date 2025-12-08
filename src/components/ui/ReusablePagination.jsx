// ui/ReusablePagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ReusablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageNumbers = true,
  className = "",
}) => {
  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Handle page click
  const handlePageClick = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(parseInt(e.target.value));
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate showing range
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`bg-gray-50 border-t px-4 py-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left side - Items per page and showing info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {showItemsPerPage && (
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} items
          </div>
        </div>

        {/* Right side - Page navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-1.5 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {showPageNumbers && (
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageClick(page)}
                    className={`w-8 h-8 text-sm border rounded-md transition-colors ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}

          <div className="text-sm text-gray-600 mx-2">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
