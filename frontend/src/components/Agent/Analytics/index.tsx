'use client';
import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export const Analytics: React.FC = () => {
  const metrics = [
    {
      title: 'Properties Listed',
      value: '142',
      change: '+23%',
      trend: 'up',
      period: 'vs last month',
    },
    {
      title: ' Acquisitions',
      value: '67',
      change: '+15%',
      trend: 'up',
      period: 'vs last month',
    },
    {
      title: 'Properties Sold',
      value: '28',
      change: '+8%',
      trend: 'up',
      period: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: '₹4.2Cr',
      change: '+32%',
      trend: 'up',
      period: 'vs last month',
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 md:mt-1">Track your agency&apos;s performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-2">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 md:p-6 p-2">
            <div className="flex items-center justify-between md:mb-2">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm text-green-600">
              {metric.change} {metric.period}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-6">
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 md:p-6 p-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-4">Property Performance</h3>
          <div className="h-20 md:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Integration with chart library needed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 md:p-6 p-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-4">Customer Engagement</h3>
          <div className="h-20 md:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Customer analytics chart</p>
              <p className="text-sm text-gray-400">Shows engagement metrics over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
        <div className="md:p-6 p-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-2 md:p-6">
          <div className="md:space-y-4 space-y-2">
            {[
              { action: 'Property shared with customer', time: '2 minutes ago', type: 'share' },
              { action: 'New customer added to system', time: '1 hour ago', type: 'customer' },
              { action: 'Meeting scheduled with client', time: '3 hours ago', type: 'meeting' },
              { action: 'Property status updated to sold', time: '5 hours ago', type: 'property' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
