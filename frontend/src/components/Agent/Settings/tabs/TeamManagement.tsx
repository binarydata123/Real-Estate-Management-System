"use client";
import React, { useState } from "react";
import {
  UserPlusIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { InviteAgentModal } from "./InviteAgentModal";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActive: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  sentAt: string;
  expiresAt: string;
}

export const TeamManagement: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock team members data
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@demoagency.com",
      role: "agency_admin",
      status: "active",
      joinedAt: "2025-01-01T00:00:00Z",
      lastActive: "2025-01-09T16:30:00Z",
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah@demoagency.com",
      role: "agent",
      status: "active",
      joinedAt: "2025-01-05T00:00:00Z",
      lastActive: "2025-01-09T14:20:00Z",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@demoagency.com",
      role: "agent",
      status: "inactive",
      joinedAt: "2025-01-03T00:00:00Z",
      lastActive: "2025-01-07T10:15:00Z",
    },
  ];

  // Mock pending invitations
  const pendingInvitations: Invitation[] = [
    {
      id: "1",
      email: "newagent@example.com",
      role: "agent",
      status: "pending",
      sentAt: "2025-01-09T10:00:00Z",
      expiresAt: "2025-01-16T10:00:00Z",
    },
    {
      id: "2",
      email: "admin@example.com",
      role: "agency_admin",
      status: "pending",
      sentAt: "2025-01-08T15:30:00Z",
      expiresAt: "2025-01-15T15:30:00Z",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "agency_admin":
        return "bg-purple-100 text-purple-800";
      case "agent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-2 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Agent
        </button>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 md:px-6 py-2 md:py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">
            Team Members ({teamMembers.length})
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="px-3 md:px-6 py-2 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
            >
              {/* Member Info */}
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {member.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last active:{" "}
                    {new Date(member.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    member.role
                  )}`}
                >
                  {member.role.replace("_", " ")}
                </span>
                <span
                  className={`inline-flex capitalize items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    member.status
                  )}`}
                >
                  {member.status}
                </span>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-3 md:px-6 py-2 md:py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">
              Pending Invitations ({pendingInvitations.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="px-3 md:px-6 py-2 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {invitation.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Invited on{" "}
                    {new Date(invitation.sentAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Expires:{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Resend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteAgentModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            // Refresh list
          }}
        />
      )}
    </div>
  );
};
