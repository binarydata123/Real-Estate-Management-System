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
    <div className="bg-[#F5F7FA] w-full flex flex-col">
      <div className="flex justify-between px-2 w-full mt-3 animate-pulse">
        <div className="bg-white/50 w-[100px] h-[25px] rounded-lg"></div>
        <div className="bg-white/50 w-[100px] h-[25px] rounded-lg"></div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between w-full bg-white shadow-sm gap-2 p-4 mt-4 animate-pulse rounded-2xl"
        >
          <div className="flex gap-2 items-center">
            <div className="h-10 w-10 rounded-full bg-white/50"></div>
            <div className="flex flex-col gap-1">
              <div className="w-[100px] rounded h-[20px] bg-white/50"></div>
              <div className="w-[100px] rounded h-[20px] bg-white/50"></div>
              <div className="w-[100px] rounded h-[20px] bg-white/50"></div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-white/50 rounded-[3px] h-[20px] w-[20px]"></div>
            <div className="bg-white/50 rounded-[3px] h-[20px] w-[20px]"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2 w-full max-w-full overflow-hidden">
      {/* Header */}
      {isFetching ? (
        <div className="flex w-full justify-between items-center">
          <div className="bg-white/50 w-[120px] h-[20px] rounded-lg"></div>
          <div className="bg-white/50 w-[100px] h-[25px] rounded-lg"></div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
          <div>
            <h3 className="text-xl font-bold text-[#0A2540]">
              Team Management
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="group flex items-center px-4 py-2.5 bg-[#0A2540] text-white rounded-[8px] hover:bg-[#B8914A] transition-colors duration-300 shadow-md hover:shadow-lg whitespace-nowrap font-medium"
          >
            <UserPlusIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Invite Agent
          </button>
        </div>
      )}

      {/* Team Members */}
      {isFetching ? (
        <SettingsSkeleton />
      ) : (
        <div className="mx-auto overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden rounded-t-2xl px-3 py-2 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] border-b border-[#C9A24D]/20">
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-[#000000]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">
                      Team Members
                    </h4>
                  </div>
                </div>
                <span className="px-4 py-2 bg-[#C9A24D] backdrop-blur-md border border-[#C9A24D]/30 text-white rounded-[8px] text-sm font-semibold shadow-[0_0_0_1px_rgba(201,162,77,0.15)]">
                  {teamMember?.length || 0}{" "}
                  {teamMember?.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>

            {/* Members List */}
            <div className="divide-y divide-gray-100 overflow-hidden">
              {teamMember?.map((member) => (
                <div
                  key={member._id}
                  className="px-3 py-4 hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-4">
                    {/* Member Info */}
                    <div className="flex items-start md:items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] rounded-xl flex items-center justify-center shadow-sm border border-[#C9A24D]/20">
                          <UsersIcon className="h-6 w-6 text-[#C9A24D]" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0A2540] text-lg truncate">
                          {member.name}
                        </p>
                        <a
                          href={`mailto:${member.email}`}
                          className="text-sm text-gray-600 truncate flex items-center gap-1.5 hover:underline mt-1"
                        >
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </a>
                      </div>

                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1.5 bg-[#C9A24D]/10 text-[#0A2540] rounded-lg text-xs font-medium whitespace-normal md:whitespace-nowrap border border-[#C9A24D]/20">
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
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center min-w-[31%] w-auto justify-center gap-1 px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                        onClick={() => {
                          router.push(`/agent/activity-logs/${member?._id}`);
                        }}
                      >
                        <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>Activity Log</span>
                      </button>

                      <button
                        onClick={() => handleUpdate(member)}
                        className="flex items-center min-w-[31%] w-auto justify-center gap-1 px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                        title="Edit member"
                      >
                        <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(member._id)}
                        className="flex items-center min-w-[31%] w-auto justify-center gap-1 px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                        title="Delete member"
                      >
                        <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
                <div className="inline-flex h-20 w-20 bg-gradient-to-br from-[#0A2540]/10 to-[#C9A24D]/10 rounded-2xl items-center justify-center mb-4 border border-[#C9A24D]/20">
                  <UsersIcon className="h-10 w-10 text-[#0A2540]/60" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A2540] mb-2">
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