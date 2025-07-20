
// EmployeeEdit.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmployeeForm from '../EmployeeForm';


const EmployeeEdit = () => {
  const { employeeId } = useParams();
  const employee = useSelector((state) => 
    state.manageTeam.employees.find(emp => emp.user_id === employeeId)
  );

  return <EmployeeForm mode="edit" initialData={employee} />;
};

export default EmployeeEdit;
