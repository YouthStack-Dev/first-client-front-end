// src/components/ui/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Limit the number of page buttons shown
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and first/last page if needed
    if (startPage > 1) pages.unshift('...');
    if (endPage < totalPages) pages.push('...');
    if (!pages.includes(1)) pages.unshift(1);
    if (!pages.includes(totalPages) && totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md border ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={`px-3 py-1 rounded-md border ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md border ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;