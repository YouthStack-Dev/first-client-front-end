import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2 } from 'lucide-react';

const DynamicTable = React.memo(
  ({ 
    headers = [], 
    data = [], 
    menuOpen, 
    onNext, 
    onPrev, 
    currentPage, 
    totalPages, 
    onMenuToggle,
    renderActions,
    onSelectItem,
    selectedItems = []
  }) => {
    const isSelected = (item) => selectedItems.some((i) => i.id === item.id);

    return (
      <div className="rounded-lg overflow-hidden shadow mt-2 w-full mx-auto">
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-[900px] border-collapse table-fixed">
            {/* Table Headers */}
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      data.forEach((item) => onSelectItem(item, e.target.checked))
                    }
                    checked={data.length > 0 && selectedItems.length === data.length}
                    className="accent-blue-600"
                  />
                </th>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={`px-4 py-3 text-sm font-medium text-gray-700 break-words whitespace-normal ${header.className || 'w-48 max-w-[12rem]'}`}
                  >
                    {header.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-24 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 2} className="p-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={(e) => onSelectItem(item, e.target.checked)}
                        className="accent-blue-600"
                      />
                    </td>
                    {headers.map((header, colIndex) => (
                      <td 
                        key={colIndex} 
                        className="px-4 py-3 text-sm text-gray-700 break-words whitespace-normal w-48 max-w-[12rem]"
                      >
                        {header.render ? header.render(item) : item[header.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center relative">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => onMenuToggle(item.id)}
                      >
                        <MoreVertical size={20} className="text-gray-600" />
                      </button>
                      {menuOpen === item.id && (
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-20">
                          {renderActions?.(item) || (
                            <>
                              <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                                <Edit size={18} color="blue" />
                                <span className="text-xs">Edit</span>
                              </button>
                              <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                                <Trash2 size={18} color="red" />
                                <span className="text-xs">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4 p-2">
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded transition 
              ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <ChevronLeft size={18} />
            Prev
          </button>

          <span className="text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded transition 
              ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }
);

export default DynamicTable;
