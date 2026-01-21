'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingOffice2Icon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  // CheckCircleIcon,
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  // ArrowTrendingUpIcon,
  BuildingLibraryIcon
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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA] via-white to-[#F5F7FA]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-[#0A2540]/10 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              {settingsData?.logoUrl ? (
                // <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-[#C9A24D]/20 bg-white p-1 shadow-sm">
                  <Image
                    src={getImageUrl(settingsData.logoUrl) as string}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                // </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A2540] to-[#0E2F52] rounded-xl flex items-center justify-center shadow-md">
                  <BuildingOffice2Icon className="h-7 w-7 text-[#C9A24D]" />
                </div>
              )}
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">
                  REAMS
                </span>
                <p className="text-xs text-gray-500">Real Estate Management</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* <Link
                href="/auth/login"
                className="text-[#0A2540] hover:text-[#C9A24D] font-medium transition-colors hidden md:block"
              >
                Sign In
              </Link> */}
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-[#0A2540] to-[#0E2F52] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540]/5 via-transparent to-[#C9A24D]/5" />
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 border border-[#C9A24D]/20 rounded-full px-4 py-2 mb-6">
                    <span className="text-sm font-semibold text-[#C9A24D]">
                      Trusted by 500+ Agencies
                    </span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-[#0A2540] via-[#0E2F52] to-[#0A2540] bg-clip-text text-transparent">
                      Elevate Your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-[#C9A24D] via-[#D4AF37] to-[#C9A24D] bg-clip-text text-transparent">
                      Real Estate Business
                    </span>
                  </h1>
                </div>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Comprehensive platform designed for modern real estate professionals. Manage properties, nurture client relationships, and drive growth with powerful analytics.
                </p>
                
                <div className="flex sm:flex-row gap-4">
                  <Link
                    href="/auth/signup"
                    className="group w-[50%] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#0A2540] to-[#0E2F52] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 shadow-lg"
                  >
                    Get Started Free
                    {/* <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> */}
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex w-[50%] items-center justify-center gap-2 border-2 border-[#0A2540]/20 text-[#0A2540] px-8 py-4 rounded-xl font-semibold hover:border-[#C9A24D] hover:text-[#C9A24D] transition-colors"
                  >
                    Explore Features
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">500+</div>
                    <div className="text-sm text-gray-600">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">1.2K+</div>
                    <div className="text-sm text-gray-600">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-6 -right-6 w-64 h-64 bg-gradient-to-br from-[#C9A24D]/20 to-transparent rounded-full blur-3xl" />
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-2xl border border-gray-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-[#C9A24D]/30 transition-colors">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#0A2540]/10 to-[#0E2F52]/10 rounded-xl flex items-center justify-center mb-4">
                        <HomeIcon className="h-7 w-7 text-[#0A2540]" />
                      </div>
                      <h3 className="font-bold text-[#0A2540] mb-2">Property Management</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-[#C9A24D]/30 transition-colors">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#C9A24D]/10 to-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4">
                        <UserGroupIcon className="h-7 w-7 text-[#C9A24D]" />
                      </div>
                      <h3 className="font-bold text-[#0A2540] mb-2">Client CRM</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-[#C9A24D]/30 transition-colors">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#0A2540]/10 to-[#0E2F52]/10 rounded-xl flex items-center justify-center mb-4">
                        <ChartBarIcon className="h-7 w-7 text-[#0A2540]" />
                      </div>
                      <h3 className="font-bold text-[#0A2540] mb-2">Analytics</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-[#C9A24D]/30 transition-colors">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#C9A24D]/10 to-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4">
                        <CalendarDaysIcon className="h-7 w-7 text-[#C9A24D]" />
                      </div>
                      <h3 className="font-bold text-[#0A2540] mb-2">Scheduling</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F5F7FA]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">
                  Powerful Features
                </span>
                <br />
                <span className="text-gray-600">for Modern Real Estate</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everything you need to streamline operations, delight clients, and grow your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#C9A24D]/30"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A2540]/10 to-[#0E2F52]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <div className="text-[#0A2540]">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-[#0A2540] mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <ShieldCheckIcon className="h-5 w-5 text-[#C9A24D]" />
              <span className="text-white font-medium">No credit card required</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of successful real estate professionals who trust REAMS to power their growth
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C9A24D] to-[#D4AF37] text-white px-10 py-5 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 shadow-lg"
              >
                Start Your Free Trial
                <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-10 py-5 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                Schedule a Demo
              </Link>
            </div>
            
            <p className="mt-8 text-white/60 text-sm">
              14-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-[#F5F7FA] border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              {settingsData?.logoUrl ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-[#C9A24D]/20 bg-white p-1.5 shadow-sm">
                  <Image
                    src={getImageUrl(settingsData.logoUrl) as string}
                    alt="Logo"
                    width={56}
                    height={56}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-[#0A2540] to-[#0E2F52] rounded-xl flex items-center justify-center shadow-md">
                  <BuildingOffice2Icon className="h-8 w-8 text-[#C9A24D]" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#0A2540] to-[#0E2F52] bg-clip-text text-transparent">
                  REAMS
                </h3>
                <p className="text-sm text-gray-500">Real Estate Agency Management System</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-600 hover:text-[#C9A24D] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#C9A24D] transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-[#C9A24D] transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} REAMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <BuildingLibraryIcon className="h-8 w-8" />,
    title: "Property Portfolio",
    description: "Manage your entire property inventory with detailed listings, media galleries, and virtual tours."
  },
  {
    icon: <UserGroupIcon className="h-8 w-8" />,
    title: "Client CRM",
    description: "Track every interaction, preference, and deal stage with intelligent client relationship management."
  },
  {
    icon: <ChartBarIcon className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Get real-time insights into market trends, agent performance, and business growth metrics."
  },
  {
    icon: <CalendarDaysIcon className="h-8 w-8" />,
    title: "Smart Scheduling",
    description: "Automate appointment booking, property viewings, and team meetings with integrated calendars."
  },
  {
    icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
    title: "Client Communication",
    description: "Unified messaging platform with templates, automation, and follow-up reminders."
  },
  {
    icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
    title: "Mobile Ready",
    description: "Access your dashboard from anywhere with our fully responsive mobile application."
  }
];