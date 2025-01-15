import React, { useState } from "react";
import { DataContext } from "./context";
// Adjust the import path if necessary
import { User } from "lucide-react";
const DataProvider = ({ children }) => {
  // Example state for holding data

  const optionArray= ["Option 1", "Option 2", "Option 3"]
  const GOVIDoptionArray= ["Adharcard", "Option 2", "Option 3"]
  const inputData = [

    {
      id: "LicenseNumber",
      label: "License Number",
      placeholder: "License Number",
      type: "text",
      required: true,
      Icon: User,
      name: "licenseNumber",
  
    },
    {
      id: "Lic-ED",
      label: "Expire Date",
      placeholder: "Expire Date",
      type: "date",
      required: true,
      Icon: User,
      name: "Lic-ED",
    },
    {
      id: "lic-doc",
      label: "Document",
      placeholder: "lic-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "lic-doc",
    }, 
    {
      id: "BGV",
      label: "BGV Status",
      required: true,
      Icon: User,
      name: "bgv",
      component: "OptionInput",
      options: optionArray,
      def: "Pending",
    },
    {
      id: "bgv-ED",
      label: "Expire Date",
      placeholder: "Expire Date",
      type: "date",
      required: true,
      Icon: User,
      name: "bgv-ED",
    },
    {
      id: "bgv-doc",
      label: "Document",
      placeholder: "bgv-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "bgv-doc",
    }, 
    // Police Verification
    {
      id: "Police-Verification",
      label: "Police Verification Status",
      required: true,
      Icon: User,
      name: "police-verification",
      component: "OptionInput",
      options: optionArray,
      def: "Pending",
    },
    {
      id: "police-ED",
      label: "Expire Date",
      placeholder: "Expire Date",
      type: "date",
      required: true,
      Icon: User,
      name: "police-ED",
    },
    {
      id: "police-doc",
      label: "Document",
      placeholder: "police-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "police-doc",
    },
  
    // Medical Verification
    {
      id: "Medical-Verification",
      label: "Medical Verification Status",
      required: true,
      Icon: User,
      name: "medical-verification",
      component: "OptionInput",
      options:optionArray,
      def: "Pending",
    },
    {
      id: "medical-ED",
      label: "Expire Date",
      placeholder: "Expire Date",
      type: "date",
      required: true,
      Icon: User,
      name: "medical-ED",
    },
    {
      id: "medical-doc",
      label: "Document",
      placeholder: "medical-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "medical-doc",
    },
  
    // Training Verification
    {
      id: "Training-Verification",
      label: "Training Verification Status",
      required: true,
      Icon: User,
      name: "training-verification",
      component: "OptionInput",
      options:optionArray,
      def: "Pending",
    },
    {
      id: "training-ED",
      label: "Expire Date",
      placeholder: "Expire Date",
      type: "date",
      required: true,
      Icon: User,
      name: "training-ED",
    },
    {
      id: "training-doc",
      label: "Document",
      placeholder: "training-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "training-doc",
    },
    {
      id: "govID",
      label: "GOV ID",
      required: true,
      Icon: User,
      name: "govID",
      component: "OptionInput",
      options:GOVIDoptionArray,
      def: "Select ID",
    },
    {
      id: "idnumber",
      label: "ID NUMBER",
      placeholder: "ID NUMBER",
      type: "Text",
      required: true,
      Icon: User,
      name: "adharID",
    },
    {
      id: "training-doc",
      label: "Document",
      placeholder: "training-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "training-doc",
    },
    {
      id: "inductiondate",
      label: "Induction Date",
      placeholder: "Induction Date",
      type: "date",
      required: true,
      Icon: User,
      name: "inductionDate",
    },
    {
      id: "training-doc",
      label: " Induction Document",
      placeholder: "training-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "training-doc",
    },
    {
      id: "currentaddress",
      label: "Cuerrent Address",
      placeholder: "Current Address",
      type: "file",
      required: true,
      Icon: User,
      name: "CurrentAddress",
    },
    {
      id: "eyetestexpiry",
      label: "EyeTest Expiry Date",
      placeholder: "Induction Date",
      type: "date",
      required: true,
      Icon: User,
      name: "inductionDate",
    },
    {
      id: "training-doc",
      label: "EyeTest ED Document",
      placeholder: "training-doc",
      type: "file",
      required: true,
      Icon: User,
      name: "training-doc",
    },
    {
      id: "letterofundertaking",
      label: "Letter of Undertaking",
      placeholder: "Letter of Undertaking",
      type: "file",
      required: true,
      Icon: User,
      name: "letterofundertaking",
    },
  ];


  return (
    <DataContext.Provider value={{inputData  ,optionArray, GOVIDoptionArray }}>
      {children}
    </DataContext.Provider>
  );
};  

export default DataProvider;
