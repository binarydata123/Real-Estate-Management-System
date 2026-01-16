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
import { Activity, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
// import { ActivityLogs } from "./ActivityLogs";

export const TeamManagement: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMember, setTeamMember] = useState<TeamMember[]>();
  const [agent, setAgent] = useState<AgentMember>();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  // const [showActivityLog, setShowActivityLog] = useState(false);
  // const [selectedMember, setSelectedMember] = useState<TeamMember>();
  // console.log("Show Activity", showActivityLog);
  const router = useRouter();
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
        <div className="mx-auto p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg md:text-xl">
                    Team Members
                  </h4>
                </div>
                <span className="px-3 md:px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                  {teamMember?.length || 0}{" "}
                  {teamMember?.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>

            {/* Members List */}
            <div className="divide-y divide-gray-100">
              {teamMember?.map((member) => (
                <div
                  key={member._id}
                  className="px-4 md:px-6 py-4 md:py-5 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-4">
                    {/* Member Info */}
                    <div className="flex items-start md:items-center gap-3 md:gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shadow-sm">
                          <UsersIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base md:text-lg truncate">
                          {member.name}
                        </p>
                        <a
                          href={`mailto:${member.email}`}
                          className="text-xs md:text-sm text-gray-600 truncate flex items-center gap-1.5 hover:underline mt-1"
                        >
                          <Mail className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </a>
                      </div>

                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium whitespace-nowrap">
                          <span className="hidden max-[400px]:inline">
                            Joined{" "}
                            {new Date(member.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>

                          <span className="inline max-[400px]:hidden">
                            Joined{" "}
                            {new Date(member.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <button
                        className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg transition-all duration-150 font-medium text-xs md:text-sm group flex-1 md:flex-initial"
                        onClick={() => {
                          // setSelectedMember(member);
                          // setShowActivityLog(true)
                          router.push(`/agent/activity-logs/${member?._id}`);
                        }}
                      >
                        <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform" />
                        <span>Activity Log</span>
                      </button>

                      <button
                        onClick={() => handleUpdate(member)}
                        className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-all duration-150 font-medium text-xs md:text-sm group flex-1 md:flex-initial"
                        title="Edit member"
                      >
                        <PencilIcon className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(member._id)}
                        className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-all duration-150 font-medium text-xs md:text-sm group flex-1 md:flex-initial"
                        title="Delete member"
                      >
                        <TrashIcon className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {(!teamMember || teamMember.length === 0) && (
              <div className="px-6 py-16 text-center">
                <div className="inline-flex h-16 w-16 bg-gray-100 rounded-2xl items-center justify-center mb-4">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No team members yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Add your first team member to get started
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* {showActivityLog && (
        <ActivityLogs memberId={selectedMember?._id as string}/>
      )} */}
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
