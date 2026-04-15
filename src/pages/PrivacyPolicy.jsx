import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  FileText,
  Database,
  Lock,
  Share2,
  UserCheck,
  Clock,
  Mail,
  ChevronRight,
  Car,
  Users,
  Globe,
  AlertCircle,
  Baby,
  RefreshCw,
  Briefcase,
  Phone,
} from "lucide-react";

const COMPANY = {
  name: "MLT Technologies",
  legalName: "MLT Corporate Solutions",
  address:
    "No. 766, 1st Main Road, 2nd Phase, 7th Block BSK 3rd Stage, Bangalore - 560085",
  email: "admin@mltcorporate.com",
  effectiveDate: "April 7, 2026",
  grievanceName: "Dheeraj Kumar",
  grievancePhone: "9035354196",
};

const SECTIONS = [
  {
    id: "introduction",
    icon: <FileText className="w-5 h-5" />,
    title: "Introduction",
    content: (
      <>
        <p>
          Welcome to <strong>{COMPANY.name}</strong>, operated by{" "}
          <strong>{COMPANY.legalName}</strong>.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our employee transportation
          application ("App"). By using the App, you agree to the collection and
          use of information in accordance with this policy.
        </p>
      </>
    ),
  },
  {
    id: "company-information",
    icon: <Briefcase className="w-5 h-5" />,
    title: "Company Information",
    content: (
      <div className="space-y-2 text-sm text-app-text-secondary">
        <div className="grid grid-cols-[120px_1fr] gap-1">
          <span className="font-medium text-app-text-primary">Company</span>
          <span>{COMPANY.legalName}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-1">
          <span className="font-medium text-app-text-primary">Address</span>
          <span>{COMPANY.address}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-1">
          <span className="font-medium text-app-text-primary">Email</span>
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-app-primary hover:underline"
          >
            {COMPANY.email}
          </a>
        </div>
      </div>
    ),
  },
  {
    id: "about-app",
    icon: <Car className="w-5 h-5" />,
    title: "About the App",
    content: (
      <>
        <p>
          <strong>{COMPANY.name}</strong> is an employee transportation
          management application that enables:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "Employee ride booking",
            "Driver trip management",
            "Vendor coordination",
            "Real-time trip tracking for operational efficiency and safety",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "users-covered",
    icon: <Users className="w-5 h-5" />,
    title: "Users Covered",
    content: (
      <>
        <p>This policy applies to:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Employees", "Drivers", "Vendors", "Escorts"].map((u) => (
            <span
              key={u}
              className="px-3 py-1 bg-app-tertiary text-app-text-primary text-sm rounded-full font-medium"
            >
              {u}
            </span>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "information-we-collect",
    icon: <Database className="w-5 h-5" />,
    title: "Information We Collect",
    content: (
      <div className="space-y-5">
        <div>
          <h4 className="font-semibold text-app-text-primary mb-2">
            5.1 Employee Data
          </h4>
          <ul className="space-y-1">
            {[
              "Employee Name",
              "Employee ID",
              "Address",
              "Phone Number",
              "Email Address",
              "Gender",
              "Geo ID (location reference for transport services)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-app-text-primary mb-2">
            5.2 Driver Data
          </h4>
          <ul className="space-y-1">
            {[
              "Driver Full Name",
              "Driver Phone Number",
              "Driver Age",
              "Driver City",
              "Driver Location (GPS)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-app-text-primary mb-2">
            5.3 Location Data
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-app-tertiary rounded-xl">
              <p className="font-medium text-app-text-primary text-sm mb-2">
                Driver Location Tracking
              </p>
              <ul className="space-y-1">
                {[
                  "Location is collected only during active trips",
                  "Tracking may continue in the background during the trip",
                  "Tracking stops when the trip ends",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-app-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-app-tertiary rounded-xl">
              <p className="font-medium text-app-text-primary text-sm mb-1">
                Employee Location
              </p>
              <p className="text-sm text-app-text-secondary">
                No background location tracking is performed for employees.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    icon: <UserCheck className="w-5 h-5" />,
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use collected data for:</p>
        <ul className="mt-3 space-y-2">
          {[
            "Assigning and managing rides",
            "Real-time trip tracking and safety monitoring",
            "Communication (trip updates, alerts)",
            "Improving service efficiency",
            "Generating reports for employers/vendors",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "third-party-services",
    icon: <Globe className="w-5 h-5" />,
    title: "Third-Party Services",
    content: (
      <>
        <p>We may use the following third-party services:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { name: "Twilio", desc: "SMS / communication" },
            { name: "Firebase", desc: "Notifications & backend" },
            { name: "Google Maps", desc: "Navigation & location" },
            { name: "Mail Services", desc: "Email communication" },
            { name: "Hostinger", desc: "Hosting infrastructure" },
          ].map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 p-3 bg-app-tertiary rounded-xl"
            >
              <div className="w-2 h-2 rounded-full bg-app-primary flex-shrink-0" />
              <div>
                <span className="font-semibold text-app-text-primary text-sm">
                  {s.name}
                </span>
                <span className="text-app-text-muted text-sm"> — {s.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3">
          These third parties may process your data only for providing their
          respective services.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    icon: <Share2 className="w-5 h-5" />,
    title: "Data Sharing",
    content: (
      <>
        <p>We may share data with:</p>
        <ul className="mt-3 space-y-2">
          {[
            "Employer organizations (for employee transport management)",
            "Vendors (for ride execution)",
            "Drivers (only necessary trip-related details)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
          <Shield className="w-4 h-4 flex-shrink-0" />
          We do not sell personal data.
        </div>
      </>
    ),
  },
  {
    id: "data-security",
    icon: <Lock className="w-5 h-5" />,
    title: "Data Security",
    content: (
      <>
        <p>We implement appropriate security measures including:</p>
        <ul className="mt-3 space-y-2">
          {[
            "Secure APIs over HTTPS",
            "Authentication using JWT-based login",
            "Controlled access to data",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            No system is 100% secure, and we cannot guarantee absolute security.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "data-retention",
    icon: <Clock className="w-5 h-5" />,
    title: "Data Retention",
    content: (
      <>
        <p>We retain data:</p>
        <ul className="mt-3 space-y-2">
          {[
            "As long as the user account is active",
            "Or as required for operational and legal purposes",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Data may be deleted upon request, subject to business and legal
          requirements.
        </p>
      </>
    ),
  },
  {
    id: "user-rights",
    icon: <UserCheck className="w-5 h-5" />,
    title: "User Rights",
    content: (
      <>
        <p>Users have the right to:</p>
        <ul className="mt-3 space-y-2">
          {[
            "Access their personal data",
            "Update their information",
            "Request corrections to inaccurate data",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-app-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          For any requests, contact us at{" "}
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-app-primary hover:underline"
          >
            {COMPANY.email}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    icon: <Baby className="w-5 h-5" />,
    title: "Children's Privacy",
    content: (
      <p>
        Our services are not intended for individuals under the age of 18. We do
        not knowingly collect data from minors.
      </p>
    ),
  },
  {
    id: "policy-changes",
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be
        posted on this page with an updated effective date. We encourage you to
        review this page periodically.
      </p>
    ),
  },
  {
    id: "grievance-officer",
    icon: <Phone className="w-5 h-5" />,
    title: "Grievance Officer (India Compliance)",
    content: (
      <>
        <p className="mb-3">
          As per the IT Act and applicable laws, our designated Grievance Officer
          is:
        </p>
        <div className="space-y-2 text-sm text-app-text-secondary">
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-medium text-app-text-primary">Name</span>
            <span>{COMPANY.grievanceName}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-medium text-app-text-primary">Email</span>
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-app-primary hover:underline"
            >
              {COMPANY.email}
            </a>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-medium text-app-text-primary">Phone</span>
            <a
              href={`tel:${COMPANY.grievancePhone}`}
              className="text-app-primary hover:underline"
            >
              {COMPANY.grievancePhone}
            </a>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "contact",
    icon: <Mail className="w-5 h-5" />,
    title: "Contact Us",
    content: (
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at{" "}
        <a
          href={`mailto:${COMPANY.email}`}
          className="text-app-primary hover:underline font-medium"
        >
          {COMPANY.email}
        </a>
        .
      </p>
    ),
  },
];

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-app-surface border-b border-app-border shadow-sidebar-item">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-app-text-muted hover:text-app-primary transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-px h-5 bg-app-border" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-app-tertiary rounded-lg">
                <Shield className="w-4 h-4 text-app-primary" />
              </div>
              <span className="font-semibold text-app-text-primary">
                Privacy Policy
              </span>
            </div>
          </div>
          <span className="text-xs text-app-text-muted bg-app-tertiary px-3 py-1 rounded-full">
            Effective: {COMPANY.effectiveDate}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-sidebar-primary to-app-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">
              {COMPANY.legalName}
            </p>
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-white/80 max-w-xl">
              This policy explains how we collect, use, and protect the
              information you provide when using the{" "}
              <strong>{COMPANY.name}</strong> employee transportation
              application.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 p-6 bg-app-surface border border-app-border rounded-2xl">
          <h2 className="text-sm font-semibold text-app-text-muted uppercase tracking-wider mb-4">
            Contents
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-app-text-secondary hover:text-app-primary transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-app-text-muted group-hover:text-app-primary transition-colors" />
                  <span>
                    {i + 1}. {section.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="p-6 bg-app-surface border border-app-border rounded-2xl scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-app-tertiary rounded-lg text-app-primary">
                  {section.icon}
                </div>
                <h2 className="text-lg font-semibold text-app-text-primary">
                  {i + 1}. {section.title}
                </h2>
              </div>
              <div className="text-sm text-app-text-secondary leading-relaxed space-y-3 pl-1">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-app-text-muted pb-8">
          © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          <br />
          Continued use of this application constitutes acceptance of this
          policy.
        </div>
      </main>
    </div>
  );
};