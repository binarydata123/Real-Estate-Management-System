import { Dialog, Transition } from "@headlessui/react";
import {
  Phone,
  Mail,
  DollarSign,
  Globe,
  StickyNote,
  X,
  Building,
} from "lucide-react";
import React from "react";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerFormData | null;
}

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
};

export default function CustomerModal({
  open,
  onClose,
  customer,
}: CustomerModalProps) {
  if (!customer) return null;

  const formatINR = (amount?: number | string) => {
    if (amount === undefined || amount === null || amount === "") return null;
    const number = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="rounded-full cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {customer.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900"
                    >
                      {customer.fullName}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Customer Details
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-200 pt-5">
                  <DetailItem
                    icon={Phone}
                    label="Phone Number"
                    value={customer.phoneNumber}
                  />
                  <DetailItem
                    icon={Mail}
                    label="Email Address"
                    value={customer.email}
                  />
                  <DetailItem
                    icon={Phone}
                    label="WhatsApp Number"
                    value={customer.whatsAppNumber}
                  />
                  <DetailItem
                    icon={DollarSign}
                    label="Budget Range"
                    value={`${formatINR(customer.minimumBudget) ?? "N/A"} - ${
                      formatINR(customer.maximumBudget) ?? "N/A"
                    }`}
                  />
                  <DetailItem
                    icon={Globe}
                    label="Lead Source"
                    value={customer.leadSource}
                  />
                  <DetailItem
                    icon={Building}
                    label="Agency"
                    value={customer.agencyId?.name}
                  />
                </div>

                {/* Notes Section */}
                {customer.initialNotes && (
                  <div className="mt-6 border-t border-gray-200 pt-5">
                    <DetailItem
                      icon={StickyNote}
                      label="Initial Notes"
                      value={
                        <p className="text-gray-700 font-normal whitespace-pre-wrap">
                          {customer.initialNotes}
                        </p>
                      }
                    />
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
