'use client';

import { useState, useEffect } from 'react';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface ReportCardProps {
    title: string;
    stations: { id: string; title: string }[];
    selectedStation: string;
    onStationChange: (stationId: string) => void;
    onGenerate?: (startTime: Date, endTime: Date) => void;
    isActive?: boolean;
}

// Format date to datetime-local input format
function formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Format date for display
function formatDateForDisplay(date: Date): string {
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

export default function ReportCard({
    title,
    stations,
    selectedStation,
    onStationChange,
    onGenerate,
    isActive = false
}: ReportCardProps) {
    // Initialize with current time and 1 hour ago
    const [endTime, setEndTime] = useState<Date>(() => new Date());
    const [startTime, setStartTime] = useState<Date>(() => {
        const start = new Date();
        start.setHours(start.getHours() - 1);
        return start;
    });
    const [error, setError] = useState<string | null>(null);

    // Validate times
    const validateTimes = (start: Date, end: Date): string | null => {
        const now = new Date();

        // Check if end time exceeds current UTC time
        if (end > now) {
            return 'End time cannot exceed current time';
        }

        // Check if start is after end
        if (start >= end) {
            return 'Start time must be before end time';
        }

        // Check if difference exceeds 1 week
        const diff = end.getTime() - start.getTime();
        if (diff > ONE_WEEK_MS) {
            return 'Time range cannot exceed 1 week';
        }

        return null;
    };

    const handleStartTimeChange = (value: string) => {
        const newStart = new Date(value);
        if (!isNaN(newStart.getTime())) {
            setStartTime(newStart);
            setError(validateTimes(newStart, endTime));
        }
    };

    const handleEndTimeChange = (value: string) => {
        const newEnd = new Date(value);
        if (!isNaN(newEnd.getTime())) {
            setEndTime(newEnd);
            setError(validateTimes(startTime, newEnd));
        }
    };

    const handleGenerate = () => {
        const validationError = validateTimes(startTime, endTime);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        onGenerate?.(startTime, endTime);
    };

    return (
        <div
            className=" overflow-hidden border-2 h-full flex flex-col transition-all"
            style={{
                backgroundColor: isActive ? '#9a9a9a' : '#b8b8b8',
                borderColor: isActive ? '#2d7a2d' : '#888',
                borderWidth: isActive ? '3px' : '2px'
            }}
        >
            {/* Title Header */}
            <div
                className="text-center py-1 px-4 flex-shrink-0"
                style={{ backgroundColor: isActive ? '#707070' : '#a0a0a0' }}
            >
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>

            {/* Content */}
            <div className="p-2 space-y-2 flex-1 flex flex-col justify-center">
                {/* Station Selector */}
                <div className="mb-1">
                    <select
                        value={selectedStation}
                        onChange={(e) => onStationChange(e.target.value)}
                        className="w-full px-2 py-1.5 bg-black text-white text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                    >
                        {stations.map((station) => (
                            <option key={station.id} value={station.id}>
                                {station.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Time Inputs Row */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Starting Time */}
                    <div>
                        <label className="block text-center text-sm font-bold text-white  px-2 py-1 rounded 2xl:text-lg" style={{ backgroundColor: '#808080' }}>
                            Starting Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formatDateForInput(startTime)}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="w-full px-2 py-2 bg-white text-black text-center text-xs font-semibold rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 2xl:text-lg"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-center text-sm font-bold text-white  px-2 py-1 rounded 2xl:text-lg" style={{ backgroundColor: '#808080' }}>
                            End Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formatDateForInput(endTime)}
                            max={formatDateForInput(new Date())}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="w-full px-2 py-2 bg-white text-black text-center text-xs font-semibold rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 2xl:text-lg"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-600 text-xs font-semibold text-center bg-red-100 px-2 py-1 rounded 2xl:text-lg">
                        {error}
                    </div>
                )}

                {/* Generate Report Button */}
                <div className="flex justify-center pt-1">
                    <button
                        onClick={handleGenerate}
                        disabled={!!error}
                        className={`text-white font-bold py-2 px-6 rounded text-sm transition-colors ${error ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                        style={{ backgroundColor: '#2d7a2d' }}
                    >
                        Generate Report
                    </button>
                </div>
            </div>
        </div>
    );
}
