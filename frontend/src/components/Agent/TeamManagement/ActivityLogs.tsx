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
        // <div className="flex justify-center items-center mt-4 md:mt-10">
        //   <div className="w-[95vw] md:w-fit overflow-auto rounded-lg border border-gray-200 shadow-sm">
        //     <table className="table-fixed divide-y divide-gray-200">
        //       <thead className="bg-gray-50">
        //         <tr>
        //           <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase border-r border-gray-200">
        //             Action
        //           </th>
        //           <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase w-[220px] border-r border-gray-200">
        //             Time
        //           </th>
        //           <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[200px] border-r border-gray-200">
        //             Message
        //           </th>
        //         </tr>
        //       </thead>
        //       <tbody className="bg-white divide-y divide-gray-200">
        //         {logs?.map((log, index) => (
        //           <tr
        //             key={index}
        //             className="hover:bg-gray-50 transition-colors"
        //           >
        //             <td className="px-6 py-4 text-[10px] md:text-sm whitespace-nowrap font-medium text-gray-900 border-r border-gray-200">
        //               {log.action}
        //             </td>
        //             <td className="px-6 py-4 text-[10px] md:text-sm  whitespace-nowrap text-gray-500 w-[220px] border-r border-gray-200">
        //               {formatToIST(log.createdAt)}
        //             </td>
        //             <td className="px-6 py-4 text-[10px] md:text-sm text-gray-700 max-w-xl break-words min-w-[200px] border-r border-gray-200">
        //               {log.message}
        //             </td>
        //           </tr>
        //         ))}
        //       </tbody>
        //     </table>
        //   </div>
        // </div>
        <div className="flex justify-center items-center mt-4 md:mt-8 px-4">
          <div className="w-full max-w-5xl space-y-3">
            {logs?.map((log, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    {/* Action Label with Icon */}
                    <div className="flex md:flex-col items-center justify-between">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 min-w-[110px] text-center">
                          {log.action}
                        </span>
                      </div>
                    </div>

                    {/* Time with improved styling */}
                    <div className="flex-shrink-0 md:w-44">
                      <div className="mt-1 text-sm text-gray-900 font-medium">
                        {formatToIST(log.createdAt)}
                      </div>
                    </div>
                    </div>

                    {/* Message with better styling */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {/* <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="text-xs text-gray-600 font-medium">
                          MESSAGE
                        </div> */}
                      </div>
                      <div className="relative">
                        <p className="text-sm text-gray-800 leading-relaxed pl-5 border-l-2 border-blue-100 bg-gray-50/50 rounded-lg break-words">
                          {log.message}
                        </p>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-indigo-300 rounded-full"></div>
                      </div>
                    </div>

                    {/* Hover indicator arrow */}
                    <div className="hidden md:block flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-5 h-5 text-blue-400"
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

                  {/* Bottom info bar (optional additional metadata) */}
                  {/* <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Log ID: {log._id?.slice(0, 8)}...</span>
                    </div>
                    <div className="text-xs text-gray-400">#{index + 1}</div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
