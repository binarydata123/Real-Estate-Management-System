'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingOffice2Icon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getSettingsData } from '@/lib/Common/Settings';
import { showErrorToast } from '@/utils/toastHandler';
import Image from 'next/image';

export default function Home() {
  const [settingsData, setSettingsData] = useState<AdminSettingData | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettingsData();
        if (response.success) {
          setSettingsData(response.data);
        }
      } catch (err) {
        showErrorToast("Error", err);
      }
    };
    fetchSettings();
  }, []);

  const getImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) return;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL as string;
    return `${baseUrl}/logo/medium/${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {settingsData?.logoUrl ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(settingsData.logoUrl) as string}
                    alt="Logo"
                    width={40}
                    height={40}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BuildingOffice2Icon className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">REAMS</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <span className="text-blue-600"> Real Estate </span>
                  Business
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                  The complete platform for real estate agents and agencies to manage properties, clients, and grow your business efficiently.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <HomeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Properties</h3>
                      <p className="text-2xl font-bold text-blue-600">500+</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Clients</h3>
                      <p className="text-2xl font-bold text-green-600">1,200+</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                        <ChartBarIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Success Rate</h3>
                      <p className="text-2xl font-bold text-orange-600">95%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed specifically for real estate professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<HomeIcon className="h-8 w-8" />}
                title="Property Management"
                description="Easily manage your entire property portfolio with intuitive tools and real-time updates."
              />
              <FeatureCard
                icon={<UserGroupIcon className="h-8 w-8" />}
                title="Client Management"
                description="Keep track of all client interactions, preferences, and communication history in one place."
              />
              <FeatureCard
                icon={<ChartBarIcon className="h-8 w-8" />}
                title="Analytics & Insights"
                description="Make data-driven decisions with comprehensive analytics and performance metrics."
              />
              <FeatureCard
                icon={<BuildingOffice2Icon className="h-8 w-8" />}
                title="Agency Dashboard"
                description="Complete oversight of your agency's operations, team performance, and business growth."
              />
              <FeatureCard
                icon={<CheckCircleIcon className="h-8 w-8" />}
                title="Meeting Scheduler"
                description="Schedule and manage property viewings and client meetings effortlessly."
              />
              <FeatureCard
                icon={<CheckCircleIcon className="h-8 w-8" />}
                title="Instant Messaging"
                description="Communicate with clients in real-time through our built-in messaging system."
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful agents and agencies already using REAMS
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {settingsData?.logoUrl ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(settingsData.logoUrl) as string}
                  alt="Logo"
                  width={32}
                  height={32}
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BuildingOffice2Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-white">REAMS</span>
          </div>
          <p className="text-gray-400">
            Real Estate Agency Management System
          </p>
          <p className="mt-4 text-sm text-gray-500">
            © 2024 REAMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
