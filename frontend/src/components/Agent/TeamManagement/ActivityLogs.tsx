"use client";
import { getActivityLogs } from "@/lib/Agent/InviteAPI ";
// import { TeamMember } from "@/types/global";
// import { X } from "lucide-react";
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
    <div className="bg-white p-2 w-[96vw] md:w-[80vw]">
      <div className="w-[100%] h-[30px] flex items-center justify-center relative mb-3">
        {logs?.length === 0 ? (
          ""
        ) : (
          <Link
            href={"/agent/team-members"}
            className="absolute left-2 !w-[20px] !h-[20px]"
          >
            <ArrowLeft className="!w-[100%] !h-[100%]" />
          </Link>
        )}
        <h1 className="text-xl  font-bold">Activity Logs</h1>
      </div>
      {logs?.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 w-[100%] h-[60vh]">
          <h1>No Activity Logs Found For this Member</h1>
          <Link href={"/agent/team-members"}>
            <button className="flex gap-1 items-center bg-primary px-4 py-2 text-white rounded-[6px] w-[80px]">
              <ArrowLeft className="!h-[10px]" />
              Go Back
            </button>
          </Link>
        </div>
      ) : (
        <div className="w-[95vw] md:w-fit overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="divide-y table-fixed divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase w-[220px]">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[200px]">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs?.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-[10px] md:text-sm whitespace-nowrap font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-[10px] md:text-sm  whitespace-nowrap text-gray-500 w-[220px]">
                    {formatToIST(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-[10px] md:text-sm text-gray-700 max-w-xl break-words min-w-[200px]">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
