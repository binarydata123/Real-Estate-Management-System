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
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { deleteTeamMember, getTeamMember } from "@/lib/Agent/InviteAPI ";
import { TeamMember } from "@/types/global";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";

export const TeamManagement: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMember, setTeamMember] = useState<TeamMember[]>();
  const [agent, setAgent] = useState<AgentMember>();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const getTeamMembers = async () => {
    setIsFetching(true);
    try {
      const res = await getTeamMember();
      if (res.success) {
        setTeamMember(res.data.teamMembers);
      }
    } catch (error) {
      showErrorToast("Error", error);
    } finally {
      setIsFetching(false);
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
        showSuccessToast(res.message);
      }
    } catch (error) {
      showErrorToast("Error", error);
    }
  };
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };
  const handleUpdate = (data: AgentMember) => {
    setAgent(data);
    setShowInviteModal(true);
  };

  const SettingsSkeleton = () => (
    <div className="bg-gray-100 border-gray-200 w-full flex flex-col">
      <div className="flex justify-between px-2 w-full mt-3 animate-pulse">
        <div className="bg-gray-200 w-[100px] h-[25px]"></div>
        <div className="bg-gray-200 w-[100px] h-[25px]"></div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between w-full bg-white shadow-sm gap-2 p-4 mt-4 animate-pulse"
        >
          <div className="flex gap-2 items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex flex-col gap-1">
              <div className="w-[100px] rounded h-[20px] bg-gray-200"></div>
              <div className="w-[100px] rounded h-[20px] bg-gray-200"></div>
              <div className="w-[100px] rounded h-[20px] bg-gray-200"></div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-gray-200 rounded-[3px] h-[20px] w-[20px]"></div>
            <div className="bg-gray-200 rounded-[3px] h-[20px] w-[20px]"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      {isFetching ? (
        <div className="flex w-full justify-between items-center">
          <div className="bg-gray-200 w-[120px] h-[20px]"></div>
          <div className="bg-gray-200 w-[100px] h-[25px] rounded-[5px]"></div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Team Management
          </h3>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors whitespace-nowrap"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Invite Agent
          </button>
        </div>
      )}

      {/* Team Members */}
      {isFetching ? (
        <SettingsSkeleton />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-lg">
                Team Members
              </h4>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {teamMember?.length || 0}{" "}
                {teamMember?.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {teamMember?.map((member) => (
              <div
                key={member._id}
                className="px-3 md:px-6 py-2 md:py-4 flex md:flex-row md:items-center justify-between gap-3 md:gap-4"
              >
                {/* Member Info */}
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-black truncate">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {member.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="text-purple-600">Created</span> :{" "}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleUpdate(member)}
                      className="p-1 text-gray-400"
                    >
                      <PencilIcon className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="p-1 text-gray-400"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
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
        onCancel={() => setShowConfirmDialog(false)}
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
