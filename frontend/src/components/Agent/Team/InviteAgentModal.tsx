'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['agent', 'agency_admin']),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteAgentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteAgentModal: React.FC<InviteAgentModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'agent',
    }
  });

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      // Demo mode - simulate invitation
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Invitation sent to ${data.email}! (Demo mode)`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Demo mode: Invitation sending simulated', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Invite Agent</h2>
            <span
              onClick={onClose}
              className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="md:p-6 p-2  md:space-y-6 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="agent@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Role *
            </label>
            <select
              {...register('role')}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="agent">Agent</option>
              <option value="agency_admin">Agency Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Welcome to our team! Looking forward to working with you."
            />
          </div>

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
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};