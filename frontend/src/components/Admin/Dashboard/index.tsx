"use client";
import React, { useEffect, useState } from "react";
import { getAllDashboardData } from "@/lib/Admin/DashboardAPI";
import {
  Users,
  Building2,
  Home,
  BarChart4,
  //ArrowUp,
} from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { showErrorToast } from "@/utils/toastHandler";
import CustomerDetailsPopup from "../Common/customerPopup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [propertyGrowthData, setPropertyGrowthData] = useState<
    PropertyGrowthData[]
  >([]);
  const [recentUsers, setRecentUsers] = useState<CustomerFormData[]>([]);
  const [recentAgencies, setRecentAgencies] = useState<AgencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CustomerFormData | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true); // Start loading
      try {
        const res = await getAllDashboardData(); // your API route
        if (res.success) {
          setStats(res.data.stats);
          setUserGrowthData(res.data.userGrowthData);
          setPropertyGrowthData(res.data.propertyGrowthData);
          setRecentUsers(res.data.recentUsers);
          setRecentAgencies(res.data.recentAgencies);
        }
      } catch (err) {
        showErrorToast("Error:", err);
      } finally {
        setIsLoading(false); // End loading
      }
    }
    fetchData();
  }, []);

  // --- SKELETON COMPONENTS ---

  const StatsCardSkeleton = () => (
    <div className="flex justify-between items-center rounded-xl bg-white shadow-lg p-2 border-t-4 border-gray-200 animate-pulse">
      <div className="">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-300 rounded w-16" />
      </div>
      {/* <div className="bg-gray-200 rounded-full p-3 shadow-lg">
                <Users className="h-7 w-7 text-transparent" aria-hidden="true" />
            </div> */}
    </div>
  );

  const ChartSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="flex-1 min-h-[18rem] bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading Chart...</div>
      </div>
    </div>
  );

  const TableSkeleton = ({ rows = 4 }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:pl-0">
                <div className="h-3 bg-gray-300 rounded w-16" />
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="h-3 bg-gray-300 rounded w-16" />
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="h-3 bg-gray-300 rounded w-16" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(rows)].map((_, i) => (
              <tr key={i} className="h-14">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const labels = userGrowthData.map((d) => d.name);

  const barChartData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: userGrowthData.map((d) => d.users),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Property Listings",
        data: propertyGrowthData.map((d) => d.properties),
        fill: false,
        borderColor: "rgb(136, 132, 216)",
        backgroundColor: "rgba(136, 132, 216, 0.5)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-2 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900  flex items-center gap-3">
        <BarChart4 className="w-8 h-8 text-blue-500" />
        Admin Dashboard
      </h1>
      <p className="text-lg text-gray-600 mb-3">
        Welcome! Here’s a quick overview of your platform’s activity and growth.
      </p>

      {/* Stats Cards */}
      <div className="mb-4">
        <dl className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading
            ? [...Array(3)].map((_, i) => <StatsCardSkeleton key={i} />) // Skeletons while loading
            : stats.map((item, index) => {
                const icons = [Users, Building2, Home];
                const Icon = icons[index] || Users;
                return (
                  <Link
                    key={item.name}
                    href={
                      item.name === "Agencies"
                        ? "/admin/agencies"
                        : item.name === "Properties"
                        ? "/admin/properties"
                        : "/admin/customers"
                    }
                  >
                    <div className="flex justify-between items-center rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 p-2 border-t-4 border-blue-500 group">
                      <div className="">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          {item.name}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {item.stat}
                        </p>
                      </div>
                      <div className="bg-blue-500 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon
                          className="h-7 w-7 text-white"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
        </dl>
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* User Growth Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 flex flex-col">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> User Growth
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Track how your user base is growing over time.
            </p>
            <div className="flex-1 min-h-[18rem]">
              <Bar options={chartOptions} data={barChartData} />
            </div>
          </div>
        )}

        {/* Property Listings Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 flex flex-col">
            <h3 className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-400" /> Property Listings
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              See the trend of new property listings on the platform.
            </p>
            <div className="flex-1 min-h-[18rem]">
              <Line options={chartOptions} data={lineChartData} />
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Tables */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Recent Users */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 overflow-x-auto">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Recent Users
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Newest users who joined the platform.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider"
                    >
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setShowUserDetailsModal(true);
                        setSelectedUser(user);
                      }}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(
                          user.createdAt as string
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Agencies */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 overflow-x-auto">
            <h3 className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" /> Recent Agencies
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Latest agencies registered on the platform.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider sm:pl-0"
                    >
                      Agency Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider"
                    >
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAgencies.map((agency) => (
                    <tr
                      key={agency._id}
                      className="hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        <Link
                          href={`/admin/agencies/${agency._id}`}
                          className="block w-full h-full"
                        >
                          {agency.name}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link
                          href={`/admin/agencies/${agency._id}`}
                          className="block w-full h-full"
                        >
                          {agency.email}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link
                          href={`/admin/agencies/${agency._id}`}
                          className="block w-full h-full"
                        >
                          {agency.phone}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {showUserDetailsModal === true && (
        <CustomerDetailsPopup
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          customerData={selectedUser}
        />
      )}
    </div>
  );
}
