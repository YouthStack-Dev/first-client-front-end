import React, { useState } from 'react';

import { Plus } from 'lucide-react';
import BusinessUnitForm from '../components/BusinessUnitForm';
import BusinessUnitList from '../components/BusinessUnitList';

const BusinessUnitScreen = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessUnits, setBusinessUnits] = useState([
    {
      id: '1',
      name: 'Marketing',
      description: 'Handles all marketing activities',
      employeeCount: 15,
      status: 'active'
    },
    {
      id: '2',
      name: 'Development',
      description: 'Software development team',
      employeeCount: 25,
      status: 'active'
    },
    {
      id: '3',
      name: 'Human Resources',
      description: 'HR management',
      employeeCount: 5,
      status: 'inactive'
    }
  ]);

  const handleCreateUnit = (newUnit) => {
    setBusinessUnits([...businessUnits, {
      ...newUnit,
      id: Date.now().toString(),
      employeeCount: 0,
      status: 'active'
    }]);
    setIsFormOpen(false);
  };

  const handleUpdateUnit = (updatedUnit) => {
    setBusinessUnits(businessUnits.map(unit => 
      unit.id === updatedUnit.id ? updatedUnit : unit
    ));
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Units</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Business Unit
        </button>
      </div>

      <BusinessUnitList 
        units={businessUnits} 
        onEdit={(unit) => {
          // For edit functionality
        }}
        onDelete={(id) => {
          setBusinessUnits(businessUnits.filter(unit => unit.id !== id));
        }}
      />

      <BusinessUnitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateUnit}
      />
    </div>
  );
};

export default BusinessUnitScreen;