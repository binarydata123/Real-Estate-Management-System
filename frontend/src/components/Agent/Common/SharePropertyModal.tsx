"use client";

import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  ShareIcon,
  UserIcon,
  UsersIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { getCustomers } from "@/lib/Agent/CustomerAPI";
import { useAuth } from "@/context/AuthContext";
import { Combobox } from "@headlessui/react";

interface SharePropertyModalProps {
  property: Property;
  onClose: () => void;
}

const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  property,
  onClose,
}) => {
  const { user } = useAuth();
  const [shareType, setShareType] = useState<"customer" | "agent">("customer");
  const [recipient, setRecipient] = useState("");
  const [includeOwnerDetails, setIncludeOwnerDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  useEffect(() => {
    if (query.length < 2) return; // wait for 2+ chars
    const fetchUsers = async () => {
      try {
        const res = await getCustomers(user?._id, query);
        setOptions(res || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, [query]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Demo mode - simulate sharing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Property shared successfully with ${recipient}! (Demo mode)`);
      onClose();
    } catch (error) {
      alert("Demo mode: Property sharing simulated");
      console.error("Error sharing property:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Share Property
            </h2>
            <span
              onClick={onClose}
              className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </span>
          </div>
        </div>

        <div className="p-2 md:p-6">
          {/* Property Preview */}
          <div className="bg-gray-50 rounded-lg md:p-4 md:mb-6 p-2 mb-2">
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <p className="text-gray-600">{property.location}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatPrice(property.price)}
            </p>
          </div>

          <form onSubmit={handleShare} className="space-y-2">
            {/* Share Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-3 mb-1">
                Share With
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShareType("customer")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    shareType === "customer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="font-medium text-gray-900">Customer</p>
                  <p className="text-sm text-gray-600">
                    Share with potential buyer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setShareType("agent")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    shareType === "agent"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="font-medium text-gray-900">Agent</p>
                  <p className="text-sm text-gray-600">Share with colleague</p>
                </button>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {shareType === "customer" ? "Select Customer" : "Select Agent"}
              </label>
              <Combobox
                value={selectedUser}
                onChange={(val) => setSelectedUser(val)}
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    displayValue={(user: User) => user?.name || ""}
                    placeholder={
                      shareType === "customer"
                        ? "Search customer by name, phone, or email..."
                        : "Search agent by email..."
                    }
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                </div>
                {options.length > 0 && (
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    {options.map((option) => (
                      <Combobox.Option
                        key={option._id}
                        value={option}
                        className={({ active }) =>
                          `cursor-pointer select-none px-4 py-2 ${
                            active ? "bg-blue-600 text-white" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <div className="flex justify-between">
                            <span>
                              {option.name}{" "}
                              {option.phone && (
                                <span className="text-gray-400">
                                  ({option.phone})
                                </span>
                              )}
                            </span>
                            {selected && <CheckIcon className="h-5 w-5" />}
                          </div>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </Combobox>
            </div>

            {/* Include Owner Details */}
            {shareType === "agent" && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeOwnerDetails}
                    onChange={(e) => setIncludeOwnerDetails(e.target.checked)}
                    className="md:h-4 md:w-4 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="md:ml-2 ml-1 text-sm text-gray-700">
                    Include owner contact details
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Only share owner details with trusted agents
                </p>
              </div>
            )}

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a personal message..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 md:space-x-4 md:pt-6 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !recipient}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                {loading ? "Sharing..." : "Share Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SharePropertyModal;
