import React from "react";
import {
  Car,
  Shield,
  MapPin,
  Users,
  BarChart,
  CheckCircle,
  Phone,
  Mail,
  Map,
  Clock,
  Wifi,
  Music,
  Umbrella,
  FileText,
  Bell,
  Radio,
  Navigation,
  Heart,
  Star,
  Award,
  ThumbsUp,
  ChevronRight,
  Play,
  PhoneCall,
  Globe,
} from "lucide-react";

const MLTCorporateLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Car className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  MLT Corporate
                </h1>
                <p className="text-sm text-gray-600">Solutions</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                "Home",
                "Services",
                "Fleet",
                "Essentials",
                "About",
                "Contact",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  {item}
                </a>
              ))}
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <PhoneCall className="h-4 w-4 mr-2" />
                Book Now
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Car Rental */}
      <section className="relative bg-gradient-to-br from-blue-900 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 rounded-full mb-6 border border-blue-400/30">
              <Car className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Premium Car Rentals</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Drive into your next adventure
              <span className="block text-blue-300">
                with unbeatable car rental deals!
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              Whether you're traveling for business or pleasure, our car rental
              service has got you covered with convenient and reliable rental
              cars for every destination.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold">
                Book Your Vehicle <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">55k+</h3>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600 font-medium">Cars in Garage</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">45k+</h3>
              <p className="text-gray-600 font-medium">Total Kilometers</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">40+</h3>
              <p className="text-gray-600 font-medium">Car Centers</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About MLT Corporate Solutions
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We are in the business of offering premium vehicle rental
                services and customer transportation to our clients, most of
                whom are the leading MNCs and Indian corporations.
              </p>
              <p className="text-gray-600 mb-8">
                Our operations' USP has been our aggressive adoption of
                technology and a mentality that drives us to go above and beyond
                when it comes to offering a variety of choices for premium car
                rentals.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">
                    Widest selection of fleet options
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Multiple price points</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">
                    Technology-driven solutions
                  </span>
                </div>
              </div>

              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Read More About Us
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-6 rounded-2xl">
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Safe & Secure</h3>
                <p className="text-gray-600 text-sm">
                  Regular compliance checks and safety measures
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl">
                <BarChart className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Cost Effective</h3>
                <p className="text-gray-600 text-sm">
                  Competitive pricing with premium service
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl mt-4">
                <Clock className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Round-the-clock customer assistance
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl mt-4">
                <Award className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Premium Quality
                </h3>
                <p className="text-gray-600 text-sm">
                  Well-maintained luxury vehicles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive transportation solutions for corporate and
              individual needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <service.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Essentials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Car Essentials & Luxury Amenities
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {essentials.map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-8 w-8 text-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            End-to-End Value Proposition
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {prop.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {prop.title}
                </h3>
                <ul className="space-y-3">
                  {prop.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                        <div className="bg-green-500 w-2 h-2 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Fleets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Luxury Fleets
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {fleets.map((car, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gray-100 rounded-2xl p-6 mb-4 h-48 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Car className="h-20 w-20 text-gray-400 group-hover:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 text-center">
                  {car.name}
                </h3>
                <p className="text-gray-500 text-sm text-center">{car.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              MLT Vehicles - Quality, Compliance & Roadworthiness
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-300 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl mb-2">Compliance Team</h3>
                    <p className="text-gray-300">
                      Regular checks on car & driver compliances to ensure
                      all-time completeness on PAN India Fleet & Drivers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-300 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl mb-2">
                      Quality Assurance
                    </h3>
                    <p className="text-gray-300">
                      Ensures vehicle roadworthiness, cleanliness, chauffeur
                      uniform & statutory compliances.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <FileText className="h-6 w-6 text-yellow-300 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl mb-2">Documentation</h3>
                    <p className="text-gray-300">
                      Compliance documents maintained at office and ready for
                      client review & audit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Car className="h-6 w-6 text-red-300 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl mb-2">
                      Vehicle Age Policy
                    </h3>
                    <p className="text-gray-300">
                      Strict 36-month aging policy for regular cars to ensure
                      best-in-class vehicles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Book Your Vehicle Now
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience premium car rental services with unmatched quality and
            reliability.
          </p>

          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Booking Form
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address *"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option>Select Vehicle Type</option>
                <option>Toyota Fortuner</option>
                <option>Toyota Crysta</option>
                <option>BMW 7 Series</option>
                <option>Benz S-Class</option>
              </select>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Submit Booking Request
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Car className="h-10 w-10 text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold">MLT Corporate</h2>
                  <p className="text-gray-400">Solutions</p>
                </div>
              </div>
              <p className="text-gray-400">
                Premium vehicle rental services and customer transportation for
                leading MNCs and corporations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {["Home", "Services", "Fleet", "About Us", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white">
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Contact Us</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-3" />
                  <span>+91 1234567890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-3" />
                  <span>info@mltcorporate.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3" />
                  <span>Multiple locations across India</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">Business Hours</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Monday - Friday: 24/7</li>
                <li>Saturday: 24/7</li>
                <li>Sunday: 24/7</li>
                <li className="text-blue-300 font-semibold mt-4">
                  Emergency: 24/7 Available
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} MLT Corporate Solutions. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Services Data
const services = [
  {
    title: "Corporate Car Rentals",
    description:
      "Total management of car rental needs through single window service",
    icon: Car,
  },
  {
    title: "Employee Transportation",
    description:
      "Save money and environment with hassle-free commute solutions",
    icon: Users,
  },
  {
    title: "Outstation Trips",
    description: "Premium cars with trained chauffeurs for memorable journeys",
    icon: MapPin,
  },
  {
    title: "Airport Transfer",
    description: "Flat rates for airport commute anywhere in India",
    icon: Navigation,
  },
  {
    title: "Expat Services",
    description: "Premium vehicles and chauffeurs for expatriates",
    icon: Globe,
  },
  {
    title: "Tool Management",
    description: "Web-based tracking and management system",
    icon: BarChart,
  },
];

// Essentials Data
const essentials = [
  { name: "Safe GPS", icon: Navigation },
  { name: "Tissues", icon: FileText },
  { name: "Stereo", icon: Music },
  { name: "First Aid Kit", icon: Heart },
  { name: "Newspaper", icon: FileText },
  { name: "Umbrella", icon: Umbrella },
  { name: "Fire Safety", icon: Shield },
  { name: "Tracker", icon: Radio },
];

// Value Propositions
const valueProps = [
  {
    number: "01",
    title: "Automation for Cost Effectiveness",
    features: [
      "Web Based Rostering",
      "Web Based Auto Routing",
      "Paperless trip Sheets",
      "Notification & Alerts",
    ],
  },
  {
    number: "02",
    title: "Safety & Security",
    features: [
      "Panic Management",
      "Alert Management",
      "Attendance Check",
      "Auto IVR",
    ],
  },
  {
    number: "03",
    title: "Real Time Tracking/Monitoring",
    features: [
      "Online dashboards",
      "Real time Trip Performance",
      "Optimum Vehicle Utilization",
    ],
  },
  {
    number: "04",
    title: "Billing & Analytics",
    features: [
      "Compliance Checks & Approval",
      "Vendor Performance",
      "Billings & MIS",
      "Data Analytics",
    ],
  },
];

// Fleets Data
const fleets = [
  { name: "Toyota Fortuner", type: "SUV" },
  { name: "Toyota Crysta", type: "Premium" },
  { name: "Toyota Camry", type: "Sedan" },
  { name: "BMW 7 Series", type: "Luxury" },
  { name: "Sedan", type: "Executive" },
  { name: "Benz S-Class", type: "Premium Luxury" },
];

export default MLTCorporateLandingPage;
