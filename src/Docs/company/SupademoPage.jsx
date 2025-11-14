import React from "react";
import { Zap, Shield, MapPin, Clock } from "lucide-react";

const SupademoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GoCab Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our interactive product demo showcasing the GoCab booking
            platform
          </p>
        </div>

        {/* Image Preview */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src="/docs/booking.jpg"
                  alt="GoCab Demo Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supademo Embed */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="aspect-[2.08] relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                <iframe
                  src="https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2&utm_source=embed"
                  loading="lazy"
                  title="GoCab Demo"
                  allow="clipboard-write"
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>

              {/* Demo Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Click and interact with the demo above to explore GoCab
                  features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast Booking
            </h3>
            <p className="text-gray-600 text-sm">
              Quick and intuitive cab booking process
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Safe Rides
            </h3>
            <p className="text-gray-600 text-sm">
              Verified drivers and real-time tracking
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Live Tracking
            </h3>
            <p className="text-gray-600 text-sm">
              Real-time location and ETA updates
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              24/7 Service
            </h3>
            <p className="text-gray-600 text-sm">
              Round-the-clock availability
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6">
              Experience the future of cab booking with GoCab's seamless
              platform
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              Book Your First Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupademoPage;
