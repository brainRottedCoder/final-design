'use client';

import { useEffect, useState } from 'react';
import WeatherStationCard from '../WeatherStationCard';
import type { WeatherStationsData } from '../../types';

interface AutomaticWeatherContentProps {
    onStationSelect?: (chartKey: string | null, title: string | null) => void;
    selectedChartKeys?: string[];
    onClearAll?: () => void;
    onParameterSelect?: (paramKey: string) => void;
    selectedParameters?: string[];
    stationsData?: WeatherStationsData;  // Optional: live API data from parent
}

export default function AutomaticWeatherContent({
    onStationSelect,
    selectedChartKeys = [],
    onClearAll,
    onParameterSelect,
    selectedParameters = [],
    stationsData,
}: AutomaticWeatherContentProps) {
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
                return prev.filter(selectedId => selectedId !== chartKey);
            } else {
                return [...prev, chartKey];
            }
        });
        onStationSelect?.(chartKey, title);
    };

    const handleClearAll = () => {
        setSelectedIds([]);
        onClearAll?.();
    };

    const handleParameterSelect = (paramKey: string) => {
        onParameterSelect?.(paramKey);
    };

    const hasSelections = selectedIds.length > 0 || selectedParameters.length > 0;

    return (
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-1 2xl:mb-1.5 flex-shrink-0">
                <h2 className="text-xl 2xl:text-2xl font-bold" style={{ color: '#303030' }}>
                    {data.sectionTitle}
                </h2>
                {hasSelections && (
                    <button
                        onClick={handleClearAll}
                        className="px-2 2xl:px-3 py-0.5 2xl:py-1 rounded-full text-xs 2xl:text-sm font-semibold transition-colors hover:bg-red-100"
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
            <div className="flex flex-col gap-1 2xl:gap-1.5 flex-1 overflow-hidden pb-1">
                {data.stations.map((station) => (
                    <div key={station.id} className="flex-1 min-h-0">
                        <WeatherStationCard
                            title={station.title}
                            windSpeed={station.windSpeed}
                            windDirection={station.windDirection}
                            temperature={station.temperature}
                            relativeHumidity={station.relativeHumidity}
                            airPressure={station.airPressure}
                            solarRadiation={station.solarRadiation}
                            rainfallHR={station.rainfallHR}
                            rainfallDay={station.rainfallDay}
                            rainfallTotal={station.rainfallTotal}
                            color={station.color as 'blue' | 'green' | 'orange'}
                            isSelected={selectedIds.includes(station.chartKey)}
                            selectedParameters={selectedParameters}
                            onClick={() => handleCardClick(station.id, station.chartKey, station.title)}
                            onParameterSelect={handleParameterSelect}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
