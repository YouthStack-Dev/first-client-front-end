import { Calendar, MapPin, TrendingUp, Users } from "lucide-react";

export const reportModules = [
  {
    id: "bookings",
    title: "Booking Reports",
    description: "Track and analyze booking data",
    icon: Calendar,
    color: "blue",
  },
];

export const REPORT_TYPES = {
  BOOKING: "bookings",
  ROUTE: "route",
  VENDOR: "vendor",
  DRIVER: "driver",
};

export const BOOKING_STATUS_OPTIONS = [
  "Request",
  "Scheduled",
  "Confirmed",
  "Completed",
  "Cancelled",
];
export const ROUTE_STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const staticDrivers = [
  {
    vendor_id: 1,
    name: "Chethan R",
    code: "DRVll131",
    email: "Chethan962089@gmail.com",
    phone: "9632728795",
    gender: "Male",
    date_of_joining: "2025-12-15",
    date_of_birth: "1992-07-08",
    permanent_address: "Doddabyalakere",
    current_address: "Shivakote",
    photo_url: null,
    bg_verify_status: "Approved",
    bg_expiry_date: "2025-12-26",
    bg_verify_url: "vendor_1/vehicle_DRVll131/bgv/20251206_034716_536e640c.pdf",
    police_verify_status: "Pending",
    police_expiry_date: "2026-01-02",
    police_verify_url:
      "vendor_1/vehicle_DRVll131/police/20251206_034716_47531290.pdf",
    medical_verify_status: "Pending",
    medical_expiry_date: "2025-12-31",
    medical_verify_url:
      "vendor_1/vehicle_DRVll131/medical/20251206_034716_4c6dcad0.pdf",
    training_verify_status: "Pending",
    training_expiry_date: "2026-01-01",
    training_verify_url:
      "vendor_1/vehicle_DRVll131/training/20251206_034716_b747944b.pdf",
    eye_verify_status: "Pending",
    eye_expiry_date: "2026-01-01",
    eye_verify_url:
      "vendor_1/vehicle_DRVll131/eye/20251206_034716_5878ddc0.pdf",
    license_number: "DL-1420110012340",
    license_expiry_date: "2026-01-01",
    license_url:
      "vendor_1/vehicle_DRVll131/license/20251206_034716_99b5f8f0.pdf",
    badge_number: "45432334590",
    badge_expiry_date: "2026-01-08",
    badge_url: "vendor_1/vehicle_DRVll131/badge/20251206_034716_c79bdd46.pdf",
    alt_govt_id_number: "214523142432468",
    alt_govt_id_type: "aadhar",
    alt_govt_id_url:
      "vendor_1/vehicle_DRVll131/alt_govt_id/20251206_034716_6e46f7ac.pdf",
    induction_date: "2025-12-30",
    induction_url:
      "vendor_1/vehicle_DRVll131/induction/20251206_034716_05c0fc14.pdf",
    is_active: true,
    driver_id: 2,
    created_at: "2025-12-06T03:47:16.613781",
    updated_at: "2025-12-06T03:47:16.613781",
  },
  {
    vendor_id: 1,
    name: "John Doeq",
    code: "DRVll",
    email: "john@ex1ample.com",
    phone: "987654qaa",
    gender: "Male",
    date_of_joining: "2025-10-10",
    date_of_birth: "1990-01-01",
    permanent_address: "123 Permanent St",
    current_address: "456 Current St",
    photo_url: null,
    bg_verify_status: "Pending",
    bg_expiry_date: "2030-01-01",
    bg_verify_url: "vendor_1/vehicle_DRVll/bgv/20251205_165442_7542e03a.pdf",
    police_verify_status: "Pending",
    police_expiry_date: "2030-01-01",
    police_verify_url:
      "vendor_1/vehicle_DRVll/police/20251205_165442_5162d25f.pdf",
    medical_verify_status: "Pending",
    medical_expiry_date: "2030-01-01",
    medical_verify_url:
      "vendor_1/vehicle_DRVll/medical/20251205_165442_68513014.pdf",
    training_verify_status: "Pending",
    training_expiry_date: "2030-01-01",
    training_verify_url:
      "vendor_1/vehicle_DRVll/training/20251205_165442_1f9a71d1.pdf",
    eye_verify_status: "Pending",
    eye_expiry_date: "2030-01-01",
    eye_verify_url: "vendor_1/vehicle_DRVll/eye/20251205_165442_4a8717a4.pdf",
    license_number: "LC123456",
    license_expiry_date: "2030-01-01",
    license_url: "vendor_1/vehicle_DRVll/license/20251205_165442_396107bb.pdf",
    badge_number: "BADGE0qaa",
    badge_expiry_date: "2030-01-01",
    badge_url: "vendor_1/vehicle_DRVll/badge/20251205_165442_5bcca565.pdf",
    alt_govt_id_number: "1234123lqaa1",
    alt_govt_id_type: "Aadhaar",
    alt_govt_id_url:
      "vendor_1/vehicle_DRVll/alt_govt_id/20251205_165442_8dc6e805.pdf",
    induction_date: "2025-10-10",
    induction_url:
      "vendor_1/vehicle_DRVll/induction/20251205_165442_daad923a.pdf",
    is_active: true,
    driver_id: 1,
    created_at: "2025-12-05T16:54:42.245296",
    updated_at: "2025-12-05T16:54:42.245296",
  },
];
