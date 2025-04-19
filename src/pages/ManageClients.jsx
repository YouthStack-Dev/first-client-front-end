import React, { useEffect, useState } from 'react';
import { Edit, MoreVertical, Plus, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { InputField, Modal } from '../components/SmallComponents';
import { useGetClientsQuery } from '../redux/rtkquery/clientRtk';
import { LocalClient } from '../Api/API_Client';
 // Hypothetical RTK Query hook for clients

// Memoized Client List Component
const ClientList = React.memo(({ clients, menuOpen, onNext, onPrev, currentPage, totalPages, isLoading }) => (
  <div className="rounded-lg overflow-hidden shadow-sm mt-2">
    {/* Table Container with Scroll */}
    <div className="overflow-auto h-[620px]">
      <table className="min-w-full border-collapse">
        {/* Table Header */}
        <thead className="bg-gray-50 border-b sticky top-0">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3 w-1/3">Client Name</th>
            <th className="px-4 py-3 w-1/3">Created At</th>
            <th className="px-4 py-3 w-1/3 text-center">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                Loading clients...
              </td>
            </tr>
          ) : clients?.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                No clients found
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{client.name}</td>
                <td className="px-4 py-3">{new Date(client.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center relative">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                  {menuOpen === client.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10">
                      <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                        <Edit size={18} color="blue" />
                        <span className="text-xs">Manage</span>
                      </button>
                      <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                        <Trash2 size={18} color="red" />
                        <span className="text-xs">Delete</span>
                      </button>
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
    <div className="flex justify-center items-center gap-4 mt-4">
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
));

function ManageClients() {
  const [currentPage, setCurrentPage] = useState(1);
  const [clientModal, setClientModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // For dropdown menu

  const { data :clients=[], isLoading } = useGetClientsQuery(); // Hypothetical RTK Query hook

console.log(" this are the clienst ", clients);



  const itemsPerPage = 10; // Adjust as needed
  const totalPages = Math.ceil((clients?.length || 0) / itemsPerPage);

  // Pagination logic
  const onPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Handle client submit
  const handleClientSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const formData = new FormData(e.target);
    const clientName = formData.get("clientName");

    console.log({ clientName });

    // Add your API call here to save the client
    setClientModal(false);
  };

  // Paginated clients
  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Manage Clients</h1>
          <button
            onClick={() => setClientModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Add client"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>

        {/* Add Client Modal */}
        <Modal
          isOpen={clientModal}
          onClose={() => setClientModal(false)}
          title="Add New Client"
          onSubmit={handleClientSubmit}
        >
          <InputField
            label="Client Name"
            name="clientName"
            placeholder="Enter client name"
            required
          />
        </Modal>

        {/* Client List */}
        <ClientList
          clients={paginatedClients}
          menuOpen={menuOpen}
          onNext={onNext}
          onPrev={onPrev}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

export default React.memo(ManageClients);