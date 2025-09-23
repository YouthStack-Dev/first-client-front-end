// import React, { useState } from 'react';
// import { Search, Filter, Plus, Building2 } from 'lucide-react';
// import CompanyCard from './CompanyCard';

// // Static data
// const companiesData = [
//   {
//     id: 1,
//     name: 'ABC Logistics',
//     email: 'contact@abclogistics.com',
//     phone: '+1 (555) 123-4567',
//     address: '123 Business Park, New York, NY 10001, United States',
//     status: 'Active',
//     createdDate: 'Jan 15, 2024',
//     vendors: [101, 102,103,104,106]
//   },
//   {
//     id: 2,
//     name: 'XYZ Transport Solutions',
//     email: 'info@xyztransport.com',
//     phone: '+1 (555) 987-6543',
//     address: '456 Industry Blvd, Los Angeles, CA 90001',
//     status: 'Active',
//     createdDate: 'Feb 20, 2024',
//     vendors: [101]
//   },
//   {
//     id: 3,
//     name: 'Global Shipping Co.',
//     email: 'support@globalshipping.com',
//     phone: '+1 (555) 456-7890',
//     address: '789 Trade Center, Chicago, IL 60601',
//     status: 'Active',
//     createdDate: 'Mar 10, 2024',
//     vendors: [103]
//   },
//   {
//     id: 4,
//     name: 'Fast Delivery Inc.',
//     email: 'hello@fastdelivery.com',
//     phone: '+1 (555) 321-0987',
//     address: '321 Express Way, Miami, FL 33101',
//     status: 'Pending',
//     createdDate: 'Apr 5, 2024',
//     vendors: []
//   }
// ];

// const vendorsData = [
//   { id: 101, name: 'City Truckers', status: 'Active' },
//   { id: 102, name: 'Regional Haulers', status: 'Active' },
//   { id: 103, name: 'Express Movers', status: 'Active' },
//   { id: 104, name: 'Heavy Load Specialists', status: 'Active' },
//   { id: 105, name: 'City Truckers', status: 'Active' },
//   { id: 106, name: 'City Truckers', status: 'Active' },
//   { id: 107, name: 'City Truckers', status: 'Active' },
// ];

// const CompanyList = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   const filteredCompanies = companiesData.filter(company => {
//     const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          company.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="space-y-6">

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search companies..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//         >
//           <option value="all">All Status</option>
//           <option value="Active">Active</option>
//           <option value="Pending">Pending</option>
//           <option value="Suspended">Suspended</option>
//         </select>
//       </div>


//       {/* Companies Grid */}
//       {filteredCompanies.length === 0 ? (
//         <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
//           <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-600">No companies found</h3>
//           <p className="text-gray-500">Try adjusting your search or filter criteria</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
//           {filteredCompanies.map(company => (
//             <CompanyCard
//               key={company.id}
//               company={company}
//               vendors={vendorsData}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyList;




import React, { useState } from "react";
import { Search, Building2 } from "lucide-react";
import CompanyCard from "./CompanyCard";

const CompanyList = ({ companies, vendors = [], onEditCompany }) => {
  // Ensure companies is always an array
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCompanies = safeCompanies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email &&
        company.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // 👇 Map backend isActive to UI status
    const companyStatus = company.status
      ? company.status
      : company.isActive
      ? "Active"
      : "Suspended";

    const matchesStatus =
      statusFilter === "all" || companyStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No companies found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              vendors={vendors} // ✅ real vendors now passed
              onEditCompany={onEditCompany} // ✅ edit works
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyList;
