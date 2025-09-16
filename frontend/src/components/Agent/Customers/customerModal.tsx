import { Dialog } from "@headlessui/react";
import {
  User,
  Phone,
  Mail,
  DollarSign,
  Globe,
  StickyNote,
  X,
} from "lucide-react";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerFormData | null;
}

export default function CustomerModal({
  open,
  onClose,
  customer,
}: CustomerModalProps) {
  if (!customer) return null;

  const formatINR = (amount?: number | string) => {
    if (!amount) return "₹0";
    const number = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full rounded-2xl shadow-2xl p-6 bg-gradient-to-br from-white to-gray-50">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">
            ✨ Customer Details
          </h2>

          {/* Customer Details */}
          <div className="space-y-5">
            {/* Full Name */}
            <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-600">Full Name</span>
              </div>
              <span className="text-gray-800">{customer.fullName}</span>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-600">WhatsApp</span>
              </div>
              <span className="text-gray-800">{customer.whatsAppNumber}</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-600">Email</span>
              </div>
              <span className="text-gray-800">{customer.email}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-600">Phone</span>
              </div>
              <span className="text-gray-800">{customer.phoneNumber}</span>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-600">Min Budget</span>
                </div>
                <span className="text-gray-800">
                  {formatINR(customer.minimumBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-600">Max Budget</span>
                </div>
                <span className="text-gray-800">
                  {formatINR(customer.maximumBudget)}
                </span>
              </div>
            </div>

            {/* Lead Source */}
            <div className="flex items-center justify-between border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-600">Lead Source</span>
              </div>
              <span className="text-gray-800">{customer.leadSource}</span>
            </div>

            {/* Notes */}
            <div className="flex flex-col border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-5 h-5 text-pink-500" />
                <span className="font-medium text-gray-600">Notes</span>
              </div>
              <span className="text-gray-800">{customer.initialNotes}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="rounded-full px-6 py-2 shadow-sm hover:bg-gray-100 border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
