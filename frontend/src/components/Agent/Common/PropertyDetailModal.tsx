"use client";

import React, { useState } from "react";
import { XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onShare: (property: Property) => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onShare,
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the contact form data to the backend
    console.log('Contact form submitted:', contactForm);
    alert('Your message has been sent to the property owner!');
    setShowContactModal(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "rented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) {
      return url; // already a full external URL
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL
      }/Properties/original/${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center p-1 md:p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl  shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {property.title}
              </h2>
              <div className="flex items-center text-gray-600 md:mt-1">
                <MapPinIcon className="hidden md:block h-4 w-4 mr-1" />
                {property.location}
              </div>
            </div>
            <div className="flex items-center space-x-1 md:space-x-3">
              <span
                onClick={onClose}
                className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 md:p-6">
          {/* Image Gallery */}
          <div className="mb-2 md:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property?.images &&
                property?.images.length > 0 &&
                property.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] overflow-hidden rounded-lg"
                  >
                    <Image
                      width={500}
                      height={500}
                      src={getImageUrl(image.url)}
                      alt={`${property.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8">
            {/* Left Column */}
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 md:mb-3 mb-1 flex items-center justify-between">
                  Property Details
                  <span
                    className={` capitalize inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      property.status
                    )}`}
                  >
                    {property.status}
                  </span>
                </h3>
                <div className="md:space-y-3 grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      {/* <CurrencyRupeeIcon className="h-4 w-4 mr-1" /> */}
                      {formatPrice(property.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {property.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {property.category}
                    </span>
                  </div>
                  {property.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium text-gray-900">
                        {property.size} {property.size_unit ?? ""}
                      </span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms</span>
                      <span className="font-medium text-gray-900">
                        {property.bedrooms}
                      </span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms</span>
                      <span className="font-medium text-gray-900">
                        {property.bathrooms}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 md:mb-3 mb-1">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description ||
                    "No description available for this property."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 md:mb-3 mb-1">
                  Features
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Parking Available",
                    "Security System",
                    "Power Backup",
                    "Water Supply",
                    "Elevator Access",
                    "Garden/Balcony",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1 md:space-x-4 pt-2 md:pt-6 border-t border-gray-200 md:mt-6 mt-2">
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Contact Owner
            </button>
            <button
              onClick={() => onShare(property)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Property
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Schedule Visit
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contact Property Owner</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="I'm interested in this property..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailModal;
