"use client";
import React, { useEffect, useState } from "react";
import {
  UserPlusIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  AgentMember,
  InviteAgentModal,
} from "../Settings/tabs/InviteAgentModal";
import { showErrorToast } from "@/utils/toastHandler";
import { deleteTeamMember, getTeamMember } from "@/lib/Agent/InviteAPI ";
import { TeamMember } from "@/types/global";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";

export const TeamManagement: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMember, setTeamMember] = useState<TeamMember[]>();
  const [agent, setAgent] = useState<AgentMember>();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const getTeamMembers = async () => {
    try {
      const res = await getTeamMember();
      if (res.success) {
        setTeamMember(res.data.teamMembers);
      }
    } catch (error) {
      showErrorToast("Error", error);
    }
  };
  useEffect(() => {
    getTeamMembers();
  }, []);
  const deleteTeamMemberApi = async (id: string) => {
    try {
      const res = await deleteTeamMember(id);
      if (res.success) {
        setTeamMember(res.data.teamMembers);
      }
    } catch (error) {
      showErrorToast("Error", error);
    }
  };
  const handleDelete = (id:string) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };
  const handleUpdate = (data: AgentMember) => {
    setAgent(data);
    setShowInviteModal(true);
  };

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
          className="flex items-center px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors whitespace-nowrap"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Agent
        </button>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 md:px-6 py-2 md:py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">
            Team Members ({teamMember?.length || 0})
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {teamMember?.map((member) => (
            <div
              key={member._id}
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
                    Created : {new Date(member.createdAt).toLocaleDateString()}
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
                  <button
                    onClick={() => handleUpdate(member)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Invite Modal */}
      {showInviteModal && (
        <InviteAgentModal
          onClose={() => {
            setShowInviteModal(false);
            setAgent({
              name: "",
              phone: "",
              email: "",
              role: "agent",
              message: "",
            });
          }}
          member={agent}
          onSuccess={() => {
            setShowInviteModal(false);
            getTeamMembers();
            // Refresh list
          }}
        />
      )}
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() =>setShowConfirmDialog(false)}
        onConfirm={() => {
          deleteTeamMemberApi(deleteId);
         setShowConfirmDialog(false);
        }}
        heading="Are you sure?"
        description="This Team Member will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};
