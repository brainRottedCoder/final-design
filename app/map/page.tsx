'use client';

import Header from '../components/Header';
import dynamic from 'next/dynamic';
import type { Station, StationType } from '../components/StationsMap';
import { useMemo, useState, useRef, useEffect } from 'react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.getElementById('map-container')?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

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
          <div
            id="map-container"
            className="rounded-2xl border border-indigo-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden flex-1 min-h-[260px] relative"
          >
            {/* Fullscreen and Dropdown Controls */}
            <div className="absolute top-3 right-3 z-[1000] flex gap-2">
              {/* Station Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Select Station
                  <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-64 max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[1001]">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search stations..."
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {filteredStations.map((station) => (
                        <button
                          key={station.id}
                          onClick={() => {
                            setSelectedStationId(station.id);
                            setShowDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-left rounded-md transition-colors ${selectedStationId === station.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                          <span className="text-xs font-medium">{station.name}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: station.type === 'Discharge' ? '#dbeafe' :
                                station.type === 'AWS' ? '#ffedd5' :
                                  station.type === 'Rain Gauge' ? '#ede9fe' : '#d1fae5',
                              color: station.type === 'Discharge' ? '#1d4ed8' :
                                station.type === 'AWS' ? '#ea580c' :
                                  station.type === 'Rain Gauge' ? '#7c3aed' : '#047857'
                            }}
                          >
                            {station.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>

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
