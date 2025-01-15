import React, { useContext, useState } from "react";


import { InputFields, OptionInput } from "./smallcomponents";
import { DataContext } from "../store/context";


const DocumentUpload = () => {
  const { inputData  } = useContext(DataContext);
  
  const [formData, setFormData] = useState({
    licenseNumber: "",
    "Lic-ED": "",
    "lic-doc": null, // File fields initialized as null
    bgv: "",
    "bgv-ED": "",
    "bgv-doc": null,
    "police-verification": "",
    "police-ED": "",
    "police-doc": null, 
    "medical-verification": "",
    "medical-ED": "",
    "medical-doc": null,
    "training-verification": "",
    "training-ED": "",
    "training-doc": null,
    govID: "",
    adharID: "",
    inductionDate: "",
    CurrentAddress: null,
    letterofundertaking: null, // File input for this field
  });
  
  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
  
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "file" ? (files && files[0]) : value, // Store file object or value
    }));
  };
  
  
  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
  // Chunk inputData into groups of 6
  const rows = inputData.reduce((acc, curr, index) => {
    if (index % 6 === 0) {
      acc.push(inputData.slice(index, index + 6));
    }
    return acc;
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Form Data:", formData);
  };

  return (
<form
  onSubmit={handleSubmit}
  className=" mx-auto  md:max-h-[68vh] lg:max-h-[72vh] overflow-y-auto rounded-lg shadow-lg"
>
  {rows.map((row, rowIndex) => (
    <div
      key={rowIndex}
      className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4 mr-3 ml-3"
    >
      {row
        .reduce((grids, input, index) => {
          // Group inputs into sets of 3
          if (index % 3 === 0) {
            grids.push(row.slice(index, index + 3));
          }
          return grids;
        }, [])
        .map((grid, gridIndex) => (
          <div
            key={gridIndex}
            className="grid md:grid-cols-3 gap-4 p-4 gap-1 border rounded-lg overflow-auto"
          >
            {grid.map((input, inputIndex) => (
              <div key={input.id} className="min-w-0">
                {input.component === "OptionInput" ? (
                  <OptionInput
                    label={input.label}
                    required={input.required}
                    Icon={input.Icon}
                    name={input.name}
                    options={input.options}
                    value={formData[input.name] || input.def}
                    onChange={handleChange}
                    def={input.def}
                  />
                ) : (
                  <InputFields
                    id={input.id}
                    label={input.label}
                    placeholder={input.placeholder}
                    type={input.type}
                    required={input.required}
                    Icon={input.Icon}
                    name={input.name}
                    value={formData[input.name] || ""}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  ))}

  <div className="p-3 text-center">
    <button
      type="submit"
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Submit
    </button>
  </div>
</form>

  );
};

export default DocumentUpload;
