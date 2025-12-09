import {
  X,
  User,
  Phone,
  MessageCircle,
  UserCheck,
  IndianRupee,
  Mail,
} from "lucide-react";

interface CustomerDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: CustomerFormData | null;
  agencyName?:string;
}

export default function CustomerDetailsPopup({
  isOpen,
  onClose,
  customerData,
  agencyName
}: CustomerDetailsPopupProps) {
  if (!isOpen || !customerData) return null;

  return (
    <div className="fixed h-[100vh] w-[100vw] inset-0 z-50 overflow-y-auto overscroll-behavior-contain">
      <div
        className="fixed inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Customer Name */}
            <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-yellow-900/20 rounded-lg border border-violet-200 dark:border-yellow-800">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Customer Name
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {customerData.fullName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Customer Email
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {customerData.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {/* WhatsApp Number */}
                {customerData.whatsAppNumber && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        WhatsApp
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customerData.whatsAppNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone Number */}
                {customerData.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customerData.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Range */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <IndianRupee className="!h-3 !w-3" />
                  Budget Range
                </p>

                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {customerData.minimumBudget
                    ? `₹ ${customerData.minimumBudget}`
                    : "N/A"}
                  <span className="text-gray-500 dark:text-gray-400">—</span>
                  {customerData.maximumBudget
                    ? `₹ ${customerData.maximumBudget}`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Created By Agency */}
            {agencyName && (
              <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created by Agency
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {agencyName}
                  </p>
                </div>
              </div>
            )}

            {/* Assigned Agent */}
            {customerData.assigned_agent && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Assigned Agent
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customerData.assigned_agent}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
