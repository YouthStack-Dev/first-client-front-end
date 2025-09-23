import React from "react";
import Header from "../components/Header";

const VendorHeader = ({ toggleSidebar, title }) => {


  return (
    <Header toggleSidebar={toggleSidebar} title={title} />
  );
};

export default VendorHeader;