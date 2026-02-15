'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CompactChartProps {
    title: string;
    unit?: string;
    riverName: string;
    data: { name: string; value: number }[];
    maxValue: number;
    pillColor?: string;
    highlightedKeys?: string[];
    isSelected?: boolean;
    isDimmed?: boolean;
    onTitleClick?: () => void;
}

const defaultPillColors: Record<string, string> = {
    'Wind Speed': '#8ac53e',
    'Humidity': '#ffd143',
    'Temperature': '#ff993a',
};

export default function CompactChart({
    title,
    unit,
    riverName,
    data,
    maxValue,
    pillColor,
    highlightedKeys = [],
    isSelected = false,
    isDimmed = false,
    onTitleClick
}: CompactChartProps) {
    const color = pillColor || defaultPillColors[title] || '#8ac53e';
    const hasSelection = highlightedKeys.length > 0;
    const safeId = `compact-${title.replace(/\s+/g, '')}-${riverName.replace(/\s+/g, '')}`;

    // Track window width for responsive chart sizing
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1536);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className={`bg-white rounded-lg 2xl:rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] 2xl:p-3 h-full flex flex-col transition-all ${isDimmed ? 'opacity-40' : ''} ${isSelected ? 'border-2 border-purple-500' : 'border-2 border-transparent'}`}>
            <div className="flex items-center gap-2 2xl:gap-3 mb-1 2xl:mb-2">
                <div
                    className={` inline-block px-2.5 2xl:px-3.5 py-0.5 2xl:py-1 rounded 2xl:rounded-md text-xs 2xl:text-sm font-semibold text-white transition-all ${onTitleClick ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''} ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-purple-500' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={onTitleClick}
                >
                    {title}{unit && <span className="ml-1 opacity-80">({unit})</span>}
                </div>
                {riverName && <span className="text-sm 2xl:text-base text-gray-600 font-medium">{riverName}</span>}
            </div>
            <div className="flex-1 min-h-0 ">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`purpleGradient-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                            <linearGradient id={`dimmedGradient-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D1D5DB" />
                                <stop offset="100%" stopColor="#E5E7EB" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="#E8E8E8" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#369fff', fontSize: isLargeScreen ? 14 : 10, fontWeight: 600 }}
                            interval={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: isLargeScreen ? 11 : 8 }}
                            domain={[0, 'auto']}
                            tickCount={3}
                            tickFormatter={(value) => `${value}`}
                            width={isLargeScreen ? 55 : 45}
                            label={unit ? {
                                value: unit,
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: isLargeScreen ? 10 : 8, fill: '#9CA3AF' },
                                offset: 8
                            } : undefined}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                fontSize: isLargeScreen ? '14px' : '11px',
                                padding: isLargeScreen ? '8px 12px' : '6px 10px'
                            }}
                            formatter={(value) => [`${value}${unit ? ` ${unit}` : ''}`, title]}
                        />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            barSize={isLargeScreen ? 20 : 16}
                        >
                            {data.map((entry, index) => {
                                const isHighlighted = !hasSelection || highlightedKeys.includes(entry.name);
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isHighlighted ? `url(#purpleGradient-${safeId})` : `url(#dimmedGradient-${safeId})`}
                                        opacity={isHighlighted ? 1 : 0.5}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
