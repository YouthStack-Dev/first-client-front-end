// data/transportData.js

// Main data object that holds both companies and vendors
export const transportData = {
    companies: [
      {
        id: 1,
        name: 'ABC Logistics',
        email: 'contact@abclogistics.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Park, New York, NY 10001, United States',
        status: 'Active',
        createdDate: 'Jan 15, 2024',
        type: 'Logistics',
        industry: 'E-commerce',
        employees: 150,
        revenue: '5.2M',
        vendors: [101, 102, 104] // Multiple vendors assigned
      },
      {
        id: 2,
        name: 'XYZ Transport Solutions',
        email: 'info@xyztransport.com',
        phone: '+1 (555) 987-6543',
        address: '456 Industry Blvd, Los Angeles, CA 90001',
        status: 'Active',
        createdDate: 'Feb 20, 2024',
        type: 'Transport',
        industry: 'Manufacturing',
        employees: 85,
        revenue: '3.8M',
        vendors: [101, 103] // Multiple vendors assigned
      },
      {
        id: 3,
        name: 'Global Shipping Co.',
        email: 'support@globalshipping.com',
        phone: '+1 (555) 456-7890',
        address: '789 Trade Center, Chicago, IL 60601',
        status: 'Active',
        createdDate: 'Mar 10, 2024',
        type: 'Shipping',
        industry: 'International',
        employees: 200,
        revenue: '8.1M',
        vendors: [103, 105] // Multiple vendors assigned
      },
      {
        id: 4,
        name: 'Fast Delivery Inc.',
        email: 'hello@fastdelivery.com',
        phone: '+1 (555) 321-0987',
        address: '321 Express Way, Miami, FL 33101',
        status: 'Pending',
        createdDate: 'Apr 5, 2024',
        type: 'Courier',
        industry: 'Local',
        employees: 45,
        revenue: '1.5M',
        vendors: [] // No vendors assigned yet
      },
      {
        id: 5,
        name: 'Premium Cargo Services',
        email: 'service@premiumcargo.com',
        phone: '+1 (555) 765-4321',
        address: '555 Cargo Plaza, Houston, TX 77001',
        status: 'Active',
        createdDate: 'May 12, 2024',
        type: 'Cargo',
        industry: 'Industrial',
        employees: 120,
        revenue: '4.5M',
        vendors: [102, 104, 105] // Multiple vendors assigned
      }
    ],
  
    vendors: [
      {
        id: 101,
        name: 'City Truckers',
        email: 'dispatch@citytruckers.com',
        phone: '+1 (555) 111-2222',
        address: '100 Truckers Lane, Dallas, TX 75201',
        fleetSize: 45,
        vehicleTypes: ['Box Trucks', 'Flatbeds', 'Refrigerated'],
        status: 'Active',
        joinedDate: 'Dec 1, 2023',
        serviceAreas: ['National', 'Regional'],
        rating: 4.8,
        companies: [1, 2] // Multiple companies assigned
      },
      {
        id: 102,
        name: 'Regional Haulers',
        email: 'contact@regionalhaulers.com',
        phone: '+1 (555) 333-4444',
        address: '200 Haulers Road, Denver, CO 80201',
        fleetSize: 28,
        vehicleTypes: ['Dry Vans', 'Reefers'],
        status: 'Active',
        joinedDate: 'Jan 10, 2024',
        serviceAreas: ['Regional', 'Local'],
        rating: 4.5,
        companies: [1, 5] // Multiple companies assigned
      },
      {
        id: 103,
        name: 'Express Movers',
        email: 'info@expressmovers.com',
        phone: '+1 (555) 555-6666',
        address: '300 Express Way, Phoenix, AZ 85001',
        fleetSize: 35,
        vehicleTypes: ['Moving Trucks', 'Box Trucks'],
        status: 'Active',
        joinedDate: 'Feb 15, 2024',
        serviceAreas: ['National'],
        rating: 4.7,
        companies: [2, 3] // Multiple companies assigned
      },
      {
        id: 104,
        name: 'Heavy Load Specialists',
        email: 'heavy@specialists.com',
        phone: '+1 (555) 777-8888',
        address: '400 Heavy Lane, Seattle, WA 98101',
        fleetSize: 12,
        vehicleTypes: ['Heavy Haul', 'Oversized'],
        status: 'Active',
        joinedDate: 'Mar 20, 2024',
        serviceAreas: ['National', 'Specialized'],
        rating: 4.9,
        companies: [1, 5] // Multiple companies assigned
      },
      {
        id: 105,
        name: 'Quick Freight Services',
        email: 'quick@freight.com',
        phone: '+1 (555) 999-0000',
        address: '500 Freight Avenue, Atlanta, GA 30301',
        fleetSize: 60,
        vehicleTypes: ['LTL', 'FTL', 'Hotshots'],
        status: 'Active',
        joinedDate: 'Apr 5, 2024',
        serviceAreas: ['National', 'Regional'],
        rating: 4.6,
        companies: [3, 5] // Multiple companies assigned
      },
      {
        id: 106,
        name: 'Eco Transport Solutions',
        email: 'eco@transports.com',
        phone: '+1 (555) 222-3333',
        address: '600 Green Road, Portland, OR 97201',
        fleetSize: 18,
        vehicleTypes: ['Electric', 'Hybrid'],
        status: 'Pending',
        joinedDate: 'May 15, 2024',
        serviceAreas: ['Local', 'Regional'],
        rating: 4.3,
        companies: [] // No companies assigned yet
      }
    ],
  
    // Helper functions to manage relationships
    getCompanyById: function(companyId) {
      return this.companies.find(company => company.id === companyId);
    },
  
    getVendorById: function(vendorId) {
      return this.vendors.find(vendor => vendor.id === vendorId);
    },
  
    getVendorsForCompany: function(companyId) {
      const company = this.getCompanyById(companyId);
      if (!company) return [];
      return company.vendors.map(vendorId => this.getVendorById(vendorId)).filter(Boolean);
    },
  
    getCompaniesForVendor: function(vendorId) {
      const vendor = this.getVendorById(vendorId);
      if (!vendor) return [];
      return vendor.companies.map(companyId => this.getCompanyById(companyId)).filter(Boolean);
    },
  
    assignVendorToCompany: function(companyId, vendorId) {
      const company = this.getCompanyById(companyId);
      const vendor = this.getVendorById(vendorId);
      
      if (company && vendor) {
        // Add vendor to company if not already assigned
        if (!company.vendors.includes(vendorId)) {
          company.vendors.push(vendorId);
        }
        
        // Add company to vendor if not already assigned
        if (!vendor.companies.includes(companyId)) {
          vendor.companies.push(companyId);
        }
        
        return true;
      }
      return false;
    },
  
    removeVendorFromCompany: function(companyId, vendorId) {
      const company = this.getCompanyById(companyId);
      const vendor = this.getVendorById(vendorId);
      
      if (company && vendor) {
        // Remove vendor from company
        company.vendors = company.vendors.filter(id => id !== vendorId);
        
        // Remove company from vendor
        vendor.companies = vendor.companies.filter(id => id !== companyId);
        
        return true;
      }
      return false;
    },
  
    // Statistics
    getStats: function () {
      const companies = this.companies || [];
      const vendors = this.vendors || [];
    
      return {
        totalCompanies: companies.length,
        activeCompanies: companies.filter(c => c.status === "Active").length,
        pendingCompanies: companies.filter(c => c.status === "Pending").length,
    
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.status === "Active").length,
        pendingVendors: vendors.filter(v => v.status === "Pending").length,
    
        totalAssignments: companies.reduce(
          (total, company) => total + (company.vendors?.length || 0),
          0
        ),
        companiesWithVendors: companies.filter(
          company => (company.vendors?.length || 0) > 0
        ).length,
        vendorsWithCompanies: vendors.filter(
          vendor => (vendor.companies?.length || 0) > 0
        ).length,
      };
    }
    
  };
  
  // Export individual arrays for easier imports
  export const { companies, vendors } = transportData;
  export const { getCompanyById, getVendorById, getVendorsForCompany, getCompaniesForVendor } = transportData;
  export const { assignVendorToCompany, removeVendorFromCompany } = transportData;
  export const { getStats } = transportData;
  
  // Default export
  export default transportData;