import React from "react";
import { ChevronLeft, ChevronRight, Edit, Trash2, Clock } from "lucide-react";

const DynamicTable = React.memo(
  ({
    headers = [],
    data = [],
    onNext,
    onPrev,
    currentPage = 1,
    totalPages = 1,
    renderActions,
    onSelectItem,
    selectedItems = [],
    onEdit,
    onDelete,
    onHistory,
  }) => {
    const isSelected = (item) => selectedItems.some((i) => i.id === item.id);

    return (
      <div className="rounded-lg overflow-hidden shadow mt-2 w-full mx-auto">
        {/* Scrollable Table Container */}
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-full table-fixed border-collapse">
            {/* Table Head */}
            <thead className="bg-gray-50 border-b sticky top-0 z-1">
              <tr className="text-left text-gray-600 text-sm">
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      data.forEach((item) =>
                        onSelectItem(item, e.target.checked)
                      )
                    }
                    checked={
                      data.length > 0 && selectedItems.length === data.length
                    }
                    className="accent-blue-600"
                  />
                </th>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 font-medium text-gray-700 whitespace-normal ${
                      header.className || "w-[16.66%]"
                    }`}
                  >
                    {header.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-36 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 2}
                    className="p-4 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b hover:bg-gray-50 transition min-h-[52px] align-middle"
                  >
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
                        className={`px-4 py-3 text-sm text-gray-700 break-words whitespace-normal ${
                          header.className || "w-[16.66%]"
                        }`}
                      >
                        {header.render
                          ? header.render(item)
                          : item[header.key] ?? "-"}
                      </td>
                    ))}
                    <td className="px-4 py-2 w-36">
                      <div className="flex justify-center items-center gap-3">
                        {renderActions ? (
                          renderActions(item)
                        ) : (
                          <>
                            {onEdit && (
                              <button
                                title="Edit"
                                className="text-blue-600 hover:bg-gray-100 p-1.5 rounded"
                                onClick={() => onEdit(item)}
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                title="Delete"
                                className="text-red-600 hover:bg-gray-100 p-1.5 rounded"
                                onClick={() => onDelete(item)}
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            {onHistory && (
                              <button
                                title="History"
                                className="text-purple-600 hover:bg-gray-100 p-1.5 rounded"
                                onClick={() => onHistory(item)}
                              >
                                <Clock size={18} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4 p-2">
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded transition 
              ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <ChevronLeft size={18} />
            Prev
          </button>

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded transition 
              ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
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
