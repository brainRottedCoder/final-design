'use client';

import { useState } from 'react';

interface WeatherStationCardProps {
    title: string;
    windSpeed: string;
    windDirection: string;
    temperature: string;
    relativeHumidity: string;
    airPressure: string;
    solarRadiation: string;
    rainfallHR: string;
    rainfallDay: string;
    rainfallTotal: string;
    color?: 'blue' | 'green' | 'orange';
    isSelected?: boolean;
    selectedParameters?: string[];
    onClick?: () => void;
    onParameterSelect?: (paramKey: string) => void;
}

const colorConfig = {
    blue: {
        bg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
        solid: '#3B82F6',
        border: '#1D4ED8',
    },
    green: {
        bg: 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)',
        solid: '#84CC16',
        border: '#4D7C0F',
    },
    orange: {
        bg: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
        solid: '#F97316',
        border: '#C2410C',
    },
};

// Parameter configuration for clickable labels
const parameterConfig = [
    { key: 'windSpeed', label: 'Wind Speed', unit: '(m/s)' },
    { key: 'windDirection', label: 'Wind Direction', unit: '(N)' },
    { key: 'temperature', label: 'Temperature', unit: '(C)' },
    { key: 'relativeHumidity', label: 'Relative Humidity', unit: '(%RH)' },
    { key: 'airPressure', label: 'Air Pressure', unit: '(hPa)' },
    { key: 'solarRadiation', label: 'Solar Radiation', unit: '(nm)' },
    { key: 'rainfallHR', label: 'Rainfall - HR', unit: '(mm)' },
    { key: 'rainfallDay', label: 'Rainfall - Day', unit: '(mm)' },
    { key: 'rainfallTotal', label: 'Rainfall - Total', unit: '(mm)' },
];

export default function WeatherStationCard({
    title,
    windSpeed = '03',
    windDirection = '03',
    temperature = '03',
    relativeHumidity = '03',
    airPressure = '03',
    solarRadiation = '03',
    rainfallHR = '03',
    rainfallDay = '03',
    rainfallTotal = '03',
    color = 'blue',
    isSelected = false,
    selectedParameters = [],
    onClick,
    onParameterSelect,
}: WeatherStationCardProps) {
    const config = colorConfig[color];

    const values: Record<string, string> = {
        windSpeed,
        windDirection,
        temperature,
        relativeHumidity,
        airPressure,
        solarRadiation,
        rainfallHR,
        rainfallDay,
        rainfallTotal,
    };

    const handleParameterClick = (e: React.MouseEvent, paramKey: string) => {
        e.stopPropagation(); // Prevent card click
        if (isSelected || !hasStationsSelected) {
            onParameterSelect?.(paramKey);
        }
    };

    const hasStationsSelected = isSelected;

    const renderParameter = (paramKey: string, label: string, unit: string) => {
        const shouldShowParameterSelection = isSelected;
        const isParamSelected = shouldShowParameterSelection && selectedParameters.includes(paramKey);
        const hasAnyParamSelected = shouldShowParameterSelection && selectedParameters.length > 0;
        const isDimmed = hasAnyParamSelected && !isParamSelected;

        return (
            <div
                className={`flex flex-col min-w-0 cursor-pointer transition-all rounded-md px-1.5 py-0.5 ${isParamSelected
                    ? 'bg-white/20 ring-1 ring-white/50'
                    : isSelected ? 'hover:bg-white/10' : ''
                    } ${isDimmed ? 'opacity-40' : ''}`}
                onClick={(e) => handleParameterClick(e, paramKey)}
            >
                <span className="text-[10px] 2xl:text-xs font-semibold text-white/85 leading-tight truncate">{label} {unit}</span>
                <span className="text-base 2xl:text-lg font-bold text-white leading-tight truncate">{values[paramKey]}</span>
            </div>
        );
    };

    return (
        <div
            className={`rounded-[12px] 2xl:rounded-[18px] px-2 2xl:px-3 py-1 2xl:py-1.5 h-full flex flex-col overflow-hidden transition-all cursor-pointer ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
            style={{
                background: config.bg,
                boxShadow: isSelected
                    ? `0 8px 20px ${config.solid}50`
                    : `0 4px 12px ${config.solid}30`,
                border: isSelected ? `3px solid ${config.border}` : '3px solid transparent',
            }}
            onClick={onClick}
        >
            <div className="flex items-center justify-center mb-0.5 2xl:mb-1 border-1 border-white bg-white rounded-lg">
                <h3
                    className="text-sm 2xl:text-lg px-3 2xl:px-4 py-0.5 2xl:py-0.5 rounded-lg 2xl:rounded-xl font-bold text-gray-800 truncate"
                >
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-x-1 gap-y-0.5 2xl:gap-x-3 2xl:gap-y-1 flex-1 content-center min-h-0 overflow-hidden">
                {/* Column 1 */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    {renderParameter('windSpeed', 'Wind Spd', '(m/s)')}
                    {renderParameter('windDirection', 'Wind Dir', '(N)')}
                    {renderParameter('temperature', 'Temp', '(°C)')}
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    {renderParameter('relativeHumidity', 'Humidity', '(%RH)')}
                    {renderParameter('airPressure', 'Pressure', '(hPa)')}
                    {renderParameter('solarRadiation', 'Solar Rad', '(nm)')}
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    {renderParameter('rainfallHR', 'Rain HR', '(mm)')}
                    {renderParameter('rainfallDay', 'Rain Day', '(mm)')}
                    {renderParameter('rainfallTotal', 'Rain Total', '(mm)')}
                </div>
            </div>
        </div>
    );
}
