import React, { useEffect, useState } from 'react';
import { Edit, MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeaderWithAction from '@components/HeaderWithAction';

const UserList = React.memo(({ users, menuOpen, onNext, onPrev, currentPage, totalPages, isLoading }) => (
  <div className="rounded-lg overflow-hidden shadow-sm mt-2">
    <div className="overflow-auto h-[620px]">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 border-b sticky top-0">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3 w-1/3">User Name</th>
            <th className="px-4 py-3 w-1/3">Email</th>
            <th className="px-4 py-3 w-1/3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">Loading users...</td>
            </tr>
          ) : users?.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-center relative">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                  {menuOpen === user.id && (
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

function ManageUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userModal, setUserModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const { data: users = [], isLoading } = useState(); // Assuming the hook fetches users

  const itemsPerPage = 10;
  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);

  const onPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userName = formData.get("userName");
    const email = formData.get("email");
    console.log({ userName, email });

    // Your API call to save user here
    setUserModal(false);
  };

  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [debouncedQuery, setDebouncedQuery] = useState('');

 var clients ;
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400); // adjust delay as needed
  
    return () => clearTimeout(handler); // cleanup previous timeout
  }, [query]);


  
  useEffect(() => {
    if (clients) {
      setSearchResults(clients);
    }
  }, [clients]);
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-2">
      <HeaderWithAction  title="Manage Users"  buttonLabel="Add User"    buttonRoute="create-employee"   />

      

        <UserList
          users={paginatedUsers}
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

export default React.memo(ManageUsers);
