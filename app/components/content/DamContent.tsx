'use client';

import React from 'react';
import StationCard, { type StationColumn } from '../StationCard';
import type { DamStation } from '../../types';

interface DamContentProps {
    data: DamStation;
    onMetricSelect?: (metric: string) => void;
    selectedMetrics?: string[];
}

export default function DamContent({ data, onMetricSelect, selectedMetrics }: DamContentProps) {
    if (!data) return null;

    const columns: StationColumn[] = [
        { label: 'Head Loss', unit: '(m)', value: data.headLoss },
        { label: 'Intech Level', unit: '(m)', value: data.intechLevel },
        { label: 'Level Pier 1', unit: '(m)', value: data.levelPier1 },
        { label: 'Level Pier 6', unit: '(m)', value: data.levelPier6 },
    ];

    return (
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
                <h2 className="text-xl font-bold" style={{ color: '#303030' }}>
                    {data.title}
                </h2>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden p-1">
                {/* Single card for Dam - fills the entire space */}
                <StationCard
                    title={data.title}
                    // These props are required by TS but ignored when columns is present
                    discharge=""
                    velocity=""
                    waterLevel=""
                    color="blue"
                    columns={columns}
                    size="large"
                    layout="grid"
                    onColumnClick={onMetricSelect}
                    selectedColumns={selectedMetrics}
                />
            </div>
        </div>
    );
}
