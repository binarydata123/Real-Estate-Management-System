"use client";
import { getActivityLogs } from "@/lib/Agent/InviteAPI ";
import React, { useEffect, useState } from "react";
import { Log } from "@/types/global";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import formatToIST from "@/helper/formatTimestampToISTDateTime";

interface modalProps {
  memberId: string;
}

export const ActivityLogs: React.FC<modalProps> = ({ memberId }) => {
  const [logs, setLogs] = useState<Log[]>();
  const getMembersActivityLogs = async () => {
    const res = await getActivityLogs(memberId);
    setLogs(res?.logs);
    console.log("Response Came as : ", res);
  };

  useEffect(() => {
    getMembersActivityLogs();
  }, []);

  return (
    <div className="bg-[#F5F7FA] p-2 w-[96vw] md:w-[80vw]">
      <div className="w-[100%] h-[30px] flex items-center justify-center relative mb-3">
        {logs?.length === 0 ? (
          ""
        ) : (
          <Link
            href={"/agent/team-members"}
            className="absolute left-2 !w-[20px] !h-[20px]"
          >
            <ArrowLeft className="!w-[100%] !h-[100%] text-[#0A2540]" />
          </Link>
        )}
        <h1 className="text-xl font-bold text-[#0A2540]">Activity Logs of {logs?.[0]?.performedBy?.name}</h1>
      </div>
      {logs?.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 w-[100%] h-[60vh]">
          <h1 className="text-[#0A2540] font-semibold">No Activity Logs Found For this Member</h1>
          <Link href={"/agent/team-members"}>
            <button className="flex gap-1 items-center bg-[#0A2540] hover:bg-[#B8914A] px-4 py-2 text-white rounded-[8px] w-[80px] transition-colors duration-300 shadow-md hover:shadow-lg">
              <ArrowLeft className="!h-[10px]" />
              Go Back
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-4 md:mt-8 px-4">
          <div className="w-full max-w-5xl space-y-3">
            {logs?.map((log, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl border border-gray-200 hover:border-[#C9A24D]/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    {/* Action Label with Icon */}
                    <div className="flex md:flex-col items-center justify-between">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#C9A24D] animate-pulse"></div>
                        <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#0A2540] border border-[#C9A24D]/30 min-w-[110px] text-center">
                          {log.action}
                        </span>
                      </div>
                    </div>

                    {/* Time with improved styling */}
                    <div className="flex-shrink-0 md:w-44">
                      <div className="mt-1 text-sm text-[#0A2540] font-medium">
                        {formatToIST(log.createdAt)}
                      </div>
                    </div>
                    </div>

                    {/* Message with better styling */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                      </div>
                      <div className="relative">
                        <p className="text-sm text-[#0A2540] leading-relaxed pl-5 border-l-2 border-[#C9A24D]/30 bg-gray-50/50 rounded-lg break-words">
                          {log.message}
                        </p>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C9A24D] to-[#C9A24D]/60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Hover indicator arrow */}
                    <div className="hidden md:block flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-5 h-5 text-[#C9A24D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};