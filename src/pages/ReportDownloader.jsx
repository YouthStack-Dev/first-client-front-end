import React, { useState } from "react";
import { API_CLIENT } from "../Api/API_Client";

const ReportDownloader = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "2025-11-19",
    end_date: "2025-11-30",
    tenant_id: "SAM001",
    shift_id: "",
    booking_status: ["Request", "Scheduled"],
    include_unrouted: true,
  });

  const downloadBookingsReport = async () => {
    try {
      const params = {
        start_date: "2025-11-19",
        end_date: "2025-11-30",
        tenant_id: "SAM001",
        shift_id: "1",
        include_unrouted: "true",
        booking_status: ["Request", "Scheduled"], // pass multiple values as array
      };

      const response = await API_CLIENT.get("/v1/reports/bookings/export", {
        params,
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "bookings_report.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Report downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await API_CLIENT.get("/v1/reports/bookings/export", {
        params: filters,

        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `bookings_report_${filters.start_date}_to_${filters.end_date}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("Report downloaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Download Bookings Report</h2>

      <input
        type="date"
        value={filters.start_date}
        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
      />

      <input
        type="date"
        value={filters.end_date}
        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
      />

      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Downloading..." : "Download Excel Report"}
      </button>
      <button onClick={downloadBookingsReport}>check</button>
    </div>
  );
};

export default ReportDownloader;
