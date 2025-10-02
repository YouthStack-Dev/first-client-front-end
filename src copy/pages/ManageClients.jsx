import { Plus, Users, Shield, Building2, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

import { MODULES } from "../staticData/Modules";
import { useState } from "react";
import { CreateClientForm } from '@components/modals/CreateClientForm';
import { log } from '../utils/logger';

const TableHeader = ({ title }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {title}
    </th>
  );
  
const ManageClients = () => {
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
  

      const handleCreateClient = (clientData) => {
          const newClient = {
            ...clientData,
            id: `client-${Date.now()}`,
            createdBy: 'super-admin',
            createdAt: new Date().toISOString()
          };
          setClients(prev => [...prev, newClient]);
          log('🚀 New Client Created:', newClient)
        };
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getModuleNames = (moduleIds) => {
    return moduleIds.map(id => {
      const module = MODULES.find(m => m.id === id);
      return module ? module.name : null;
    }).filter(Boolean);
  };
    return(
     
      <>
  
        <div className=" mx-auto px-4 sm:px-6 lg:px-2 py-3">

  
          {/* Client Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
                  <p className="text-sm text-gray-500">Manage clients and their module permissions</p>
                </div>
                <button
                  onClick={() => setShowCreateClient(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Client</span>
                </button>
              </div>
  
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* Clients Table */}
            <div className="overflow-x-auto">
              {filteredClients.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-500 mb-4">
                    {clients.length === 0
                      ? "Get started by creating your first client"
                      : "Try adjusting your search or filter criteria"}
                  </p>
                  {clients.length === 0 && (
                    <button
                      onClick={() => setShowCreateClient(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Client
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeader title="Client" />
                      <TableHeader title="Company" />
                      <TableHeader title="Modules Access" />
                      <TableHeader title="Status" />
                      <TableHeader title="Created" />
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.companyName}</div>
                          {client.contactPerson && (
                            <div className="text-sm text-gray-500">{client.contactPerson}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {getModuleNames(client.allowedModules).slice(0, 3).map((name, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {name}
                              </span>
                            ))}
                            {client.allowedModules.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{client.allowedModules.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-yellow-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
  
        {/* Create Client Modal */}
        <CreateClientForm
          isOpen={showCreateClient}
          onClose={() => setShowCreateClient(false)}
          onSubmit={handleCreateClient}
        />
</>
    )
 }

 export default ManageClients