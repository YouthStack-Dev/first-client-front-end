import React from "react";
import { Truck } from "lucide-react";
import VendorCard from "./VendorCard";

const NewVendorList = ({ vendors = [], onAssignEntity }) => (
  <div>
    {vendors.length === 0 ? (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">No vendors found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {vendors.map((vendor, index) => (
          <VendorCard
            key={vendor._id || vendor.id || index}
            vendor={vendor}
            onAssignEntity={() => onAssignEntity?.(vendor)}
          />
        ))}
      </div>
    )}
  </div>
);

export default NewVendorList;
