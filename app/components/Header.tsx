'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export type TabType = 'overview' | 'discharge' | 'weather' | 'rain-gauge' | 'map' | 'dam';

const tabs: { id: TabType; label: string; path: string }[] = [
  { id: 'overview', label: 'Overview', path: '/overview' },
  { id: 'discharge', label: 'Discharge Station', path: '/station-data' },
  { id: 'weather', label: 'Automatic Weather Station', path: '/automatic-weather' },
  { id: 'rain-gauge', label: 'Rain Gauge Station', path: '/rain-gauge-reports' },
  { id: 'map', label: 'Map', path: '/map' },
];

interface HeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from pathname if activeTab prop not explicitly provided
  const derivedActiveTab: TabType =
    activeTab ??
    (tabs.find((t) => pathname?.startsWith(t.path))?.id ?? 'overview');

  const handleTabClick = (tab: TabType) => {
    const tabConfig = tabs.find((t) => t.id === tab);
    if (!tabConfig) return;

    router.push(tabConfig.path);
    onTabChange?.(tab);
  };

  return (
    <header style={{ backgroundColor: '#f5f5f5' }}>
      <div className="flex items-center justify-between px-6 2xl:px-8 py-2 2xl:py-3">
        {/* Logo Left */}
        <div className="relative w-[50px] h-[52px] 2xl:w-[70px] 2xl:h-[72px]">
          <Image src="/download.jpg" alt="Logo" fill className="object-cover" />
        </div>
        {/* Heading */}
        <h1 className="ml-4 text-base 2xl:text-2xl font-bold text-indigo-900 whitespace-nowrap">
          Early warning system UJVNL Lakhwar
        </h1>
        {/* Navigation Tabs */}
        <nav className="flex gap-10 2xl:gap-14 ml-auto">
          {tabs.map((tab) => {
            const isActive = derivedActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-6 2xl:px-8 py-2.5 2xl:py-3.5 text-sm 2xl:text-lg cursor-pointer font-semibold rounded-md 2xl:rounded-lg border-2 transition-all ${isActive
                  ? 'bg-white text-purple-700 border-purple-500 shadow-sm'
                  : 'bg-white text-gray-400 border-transparent hover:border-gray-300 hover:text-gray-500'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        {/* Logo Right */}
        <div className="relative w-[50px] h-[52px] 2xl:w-[70px] 2xl:h-[72px] ml-4">
          <Image src="/logo.png" alt="Logo" fill className="object-cover" />
        </div>
      </div>
    </header>
  );
}