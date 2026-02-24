'use client';

import Header from '../components/Header';
import dynamic from 'next/dynamic';
import type { Station, StationType } from '../components/StationsMap';
import { useMemo, useState } from 'react';

const StationsMap = dynamic(() => import('../components/StationsMap'), { ssr: false });

const STATIONS: Station[] = [
  { id: 'discharge-syana-chatti', type: 'Discharge', name: 'Syana Chatti', lat: 30.905956, lon: 78.360214 },
  { id: 'discharge-kisala', type: 'Discharge', name: 'Kisala', lat: 30.855556, lon: 78.285578 },
  { id: 'discharge-kharadi', type: 'Discharge', name: 'Kharadi', lat: 30.821142, lon: 78.235703 },
  { id: 'discharge-purola', type: 'Discharge', name: 'Purola', lat: 30.832161, lon: 78.097931 },
  { id: 'discharge-aglad-bridge', type: 'Discharge', name: 'Aglad Bridge', lat: 30.514358, lon: 77.999603 },
  { id: 'discharge-bhediyana', type: 'Discharge', name: 'Bhediyana', lat: 30.509967, lon: 77.983458 },
  { id: 'discharge-juddo-dam', type: 'Discharge', name: 'Juddo Dam', lat: 30.523556, lon: 77.914567 },
  { id: 'discharge-hathiyari', type: 'Discharge', name: 'Hathiyari', lat: 30.524031, lon: 77.884856 },
  { id: 'aws-thatyur', type: 'AWS', name: 'Thatyur', lat: 30.506483, lon: 78.1652 },
  { id: 'aws-lakhwar', type: 'AWS', name: 'Lakhwar', lat: 30.510759, lon: 77.943011 },
  { id: 'aws-kisala', type: 'AWS', name: 'Kisala', lat: 30.855556, lon: 78.285578 },
  { id: 'rain-nagtiba', type: 'Rain Gauge', name: 'Nagtiba', lat: 30.586892, lon: 78.087914 },
  { id: 'rain-kandimalli', type: 'Rain Gauge', name: 'KandiMalli', lat: 30.531725, lon: 78.007053 },
  { id: 'rain-juddo', type: 'Rain Gauge', name: 'Juddo', lat: 30.520414, lon: 77.914848 },
  { id: 'rain-purola', type: 'Rain Gauge', name: 'Purola', lat: 30.880086, lon: 78.073925 },
  { id: 'rain-surakhet', type: 'Rain Gauge', name: 'Surakhet', lat: 30.802972, lon: 78.187789 },
  { id: 'rain-dhanaulti', type: 'Rain Gauge', name: 'Dhanaulti', lat: 30.426903, lon: 78.243839 },
  { id: 'rain-surnol', type: 'Rain Gauge', name: 'Surnol', lat: 30.919892, lon: 78.224136 },
  { id: 'rain-jaindeo', type: 'Rain Gauge', name: 'Jaindeo', lat: 30.608642, lon: 77.959983 },
  { id: 'rain-gauraghati', type: 'Rain Gauge', name: 'GauraGhati', lat: 30.7257, lon: 78.007753 },
  { id: 'dam-vyasi', type: 'Dam', name: 'Vyasi Dam', lat: 30.520428, lon: 77.915274 },
];

// Precomputed center of the cluster
const CENTER = { lat: 30.7, lon: 78.0 };

const TABS: { id: StationType | 'All'; label: string }[] = [
  { id: 'All', label: 'All Stations' },
  { id: 'Discharge', label: 'Discharge Stations' },
  { id: 'AWS', label: 'AWS' },
  { id: 'Rain Gauge', label: 'Rain Gauge' },
  { id: 'Dam', label: 'Dam' },
];

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<StationType | 'All'>('All');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const filteredStations = useMemo(() => {
    if (activeTab === 'All') return STATIONS;
    return STATIONS.filter((s) => s.type === activeTab);
  }, [activeTab]);

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: '#eef2ff' }}
    >
      <Header />
      <main className="flex-1 p-4 2xl:p-6 flex flex-col gap-3 2xl:gap-4">
        <div className="flex flex-col gap-3 2xl:gap-4 flex-1">
          {/* Classification tabs */}
          <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm px-2.5 py-2 flex flex-wrap gap-2 text-xs 2xl:text-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'px-3 py-1.5 rounded-full border text-xs 2xl:text-sm transition-colors ' +
                    (isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Map */}
          <div className="rounded-2xl border border-indigo-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden flex-1 min-h-[260px]">
            <StationsMap
              center={CENTER}
              stations={filteredStations}
              selectedStationId={selectedStationId}
            />
          </div>

          {/* Station list */}
          <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-3 2xl:p-4 max-h-60 overflow-auto text-xs 2xl:text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                {activeTab === 'All' ? 'All Stations' : `${activeTab} Stations`}
              </div>
              <div className="text-[11px] text-gray-500">
                {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {filteredStations.map((s) => {
                const isSelected = selectedStationId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStationId(s.id)}
                    className={
                      'flex flex-col items-start text-left border rounded-lg px-2 py-1.5 transition-colors ' +
                      (isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100')
                    }
                  >
                    <span className="font-semibold text-gray-800">{s.name}</span>
                    <span className="text-[11px] text-gray-500">Type: {s.type}</span>
                    <span className="text-[11px] text-gray-500">
                      Lat: {s.lat.toFixed(5)}, Lon: {s.lon.toFixed(5)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
