'use client';

import React from 'react';
import CompactChart from '../CompactChart';
import type { WeatherStatisticsData } from '../../types';

interface WeatherStatisticsProps {
    highlightedKeys?: string[];
    selectedTitles?: string[];
    selectedParameters?: string[];
    statisticsData?: WeatherStatisticsData;  // Live API data from parent
}

// Define chart configurations with colors and units
const chartConfigs = [
    { key: 'windSpeed', title: 'Wind Speed', unit: 'm/s', color: '#8ac53e' },
    { key: 'windDirection', title: 'Wind Direction', unit: 'N', color: '#3B82F6' },
    { key: 'temperature', title: 'Temperature', unit: '°C', color: '#ff993a' },
    { key: 'relativeHumidity', title: 'Humidity', unit: '%RH', color: '#ffd143' },
    { key: 'airPressure', title: 'Air Pressure', unit: 'hPa', color: '#6366F1' },
    { key: 'solarRadiation', title: 'Solar Radiation', unit: 'W/m²', color: '#F97316' },
    { key: 'rainfallHR', title: 'Rainfall HR', unit: 'mm', color: '#06B6D4' },
    { key: 'rainfallDay', title: 'Rainfall Day', unit: 'mm', color: '#14B8A6' },
    { key: 'rainfallTotal', title: 'Rainfall Total', unit: 'mm', color: '#8B5CF6' },
];

// Parameter labels for display
const parameterLabels: Record<string, string> = {
    windSpeed: 'Wind Speed',
    windDirection: 'Wind Direction',
    temperature: 'Temperature',
    relativeHumidity: 'Humidity',
    airPressure: 'Air Pressure',
    solarRadiation: 'Solar Radiation',
    rainfallHR: 'Rainfall HR',
    rainfallDay: 'Rainfall Day',
    rainfallTotal: 'Rainfall Total',
};

export default function WeatherStatistics({
    highlightedKeys = [],
    selectedTitles = [],
    selectedParameters = [],
    statisticsData,
}: WeatherStatisticsProps) {
    if (!statisticsData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-semibold">No data available</span>
            </div>
        );
    }

    const weatherStats = statisticsData;
    const hasParameterSelection = selectedParameters.length > 0;

    return (
        <div className="flex flex-col min-h-0 h-full">
            <div className="flex  items-center gap-2 2xl:gap-3 mb-2 2xl:mb-3 flex-wrap">
                <h2 className="text-xl 2xl:text-3xl font-bold" style={{ color: '#303030' }}>
                    {weatherStats.sectionTitle}
                </h2>
                {/* Selected station pills */}
                {selectedTitles.map((title, index) => (
                    <span
                        key={`station-${index}`}
                        className="px-2 2xl:px-3 py-0.5 2xl:py-1 rounded-full text-xs 2xl:text-sm font-semibold"
                        style={{
                            backgroundColor: 'rgba(124, 58, 237, 0.15)',
                            color: '#7C3AED'
                        }}
                    >
                        {title}
                    </span>
                ))}
                {/* Selected parameter pills */}
                {selectedParameters.map((paramKey) => {
                    const config = chartConfigs.find(c => c.key === paramKey);
                    return (
                        <span
                            key={`param-${paramKey}`}
                            className="px-2 2xl:px-3 py-0.5 2xl:py-1 rounded-full text-xs 2xl:text-sm font-semibold text-white"
                            style={{ backgroundColor: config?.color || '#7C3AED' }}
                        >
                            {parameterLabels[paramKey]}
                        </span>
                    );
                })}
            </div>
            <div className="grid grid-cols-3 grid-rows-3 grid-flow-col gap-2 2xl:gap-2 flex-1 overflow-hidden ">
                {chartConfigs.map((config) => {
                    const chartData = weatherStats.charts[config.key as keyof typeof weatherStats.charts];
                    const isSelected = selectedParameters.includes(config.key);
                    const isDimmed = hasParameterSelection && !isSelected;

                    return (
                        <CompactChart

                            key={config.key}
                            title={config.title}
                            unit={config.unit}
                            riverName=""
                            data={chartData.data}
                            maxValue={weatherStats.maxValue}
                            highlightedKeys={highlightedKeys}
                            pillColor={config.color}
                            isSelected={isSelected}
                            isDimmed={isDimmed}
                        />
                    );
                })}
            </div>
        </div>
    );
}
