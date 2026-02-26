'use client';

import { useEffect, useState } from 'react';
import StationCard from '../StationCard';
import type { DischargeStationsData } from '../../types';

interface DischargeStationsContentProps {
    onStationSelect?: (chartKey: string | null, title: string | null) => void;
    selectedChartKeys?: string[];  // Passed from parent to sync selection state
    onClearAll?: () => void;  // Callback to clear all selections
    stationsData?: DischargeStationsData;  // Optional: live API data from parent
}

export default function DischargeStationsContent({ onStationSelect, selectedChartKeys = [], onClearAll, stationsData }: DischargeStationsContentProps) {
    // Use chartKey for local selection state to match parent's selectedChartKeys
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!stationsData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-semibold">No data available</span>
            </div>
        );
    }

    const data = stationsData;

    // Sync local selection state with parent's selectedChartKeys
    useEffect(() => {
        // Get all chartKeys from stations
        const stationChartKeys = stationsData?.stations.map(s => s.chartKey) || [];

        // Filter selectedChartKeys to only include valid station keys that exist in current stations
        const validKeys = selectedChartKeys.filter(key => stationChartKeys.includes(key));

        // Always set to exactly the valid keys (replace entirely, don't merge)
        setSelectedIds(validKeys);
    }, [selectedChartKeys, stationsData]);

    const handleCardClick = (id: string, chartKey: string, title: string) => {
        setSelectedIds(prev => {
            const isSelected = prev.includes(chartKey);
            if (isSelected) {
                // Deselect - remove from array
                return prev.filter(selectedId => selectedId !== chartKey);
            } else {
                // Select - add to array
                return [...prev, chartKey];
            }
        });
        // Pass to parent for chart highlighting
        onStationSelect?.(chartKey, title);
    };

    const handleClearAll = () => {
        setSelectedIds([]);
        onClearAll?.();
    };

    return (
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
                <h2 className="text-xl font-bold" style={{ color: '#303030' }}>
                    {data.sectionTitle}
                </h2>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold transition-colors hover:bg-red-100"
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 grid-rows-4 gap-2 flex-1 min-h-0 overflow-hidden p-1">
                {data.stations.map((station) => (
                    <StationCard
                        key={station.id}
                        title={station.title}
                        riverName={station.riverName}
                        discharge={station.discharge}
                        velocity={station.velocity}
                        waterLevel={station.waterLevel}
                        color={station.color}
                        isSelected={selectedIds.includes(station.chartKey)}
                        onClick={() => handleCardClick(station.id, station.chartKey, station.title)}
                    />
                ))}
            </div>
        </div>
    );
}
