'use client';

import { useState, useEffect } from 'react';
import ReportPage, { type ReportPageConfig, type ExportOptions, type FetchDataResult } from '../components/ReportPage';
import type { TableRow } from '../services/stationDataGenerator';

const vyasiDamConfig: ReportPageConfig = {
    id: 'vyasi-dam',
    titleConfig: {
        reportType: 'vyasi-dam',
        title: 'Vyasi Dam Reports',
        badge: 'DAM MONITORING • LEVEL DATA • EXPORT READY',
        stationLabel: 'Dam',
        multiSelect: false,
    },
    columns: [
        { key: 'sno', label: 'S.No', align: 'center' },
        { key: 'timestamp', label: 'TimeStamp', align: 'left' },
        { key: 'damLevel', label: 'Dam Level (m)', align: 'right' },
        { key: 'waterFlow', label: 'Water Flow (m³/s)', align: 'right' },
        { key: 'reservoirCapacity', label: 'Reservoir Capacity (%)', align: 'right' },
    ],
};

/** Format a Date to ISO string without timezone (e.g. 2026-02-09T00:00:00) */
const fmtDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function fetchVyasiDamData({
    stationIds,
    start,
    end,
    page,
    pageSize,
}: {
    stationIds: string[];
    start: Date;
    end: Date;
    page: number;
    pageSize: number;
}): Promise<FetchDataResult> {
    // TODO: Replace with actual API call when endpoint is available
    const dummyData: TableRow[] = [];
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    const interval = 30 * 60 * 1000; // 30 minutes

    for (let timestamp = startTimestamp; timestamp <= endTimestamp; timestamp += interval) {
        const date = new Date(timestamp);
        dummyData.push({
            id: dummyData.length,
            sno: dummyData.length + 1,
            timestamp: date.toLocaleString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }),
            utcTime: date.toISOString(),
            milliseconds: date.getMilliseconds(),
            user: 0,
            reason: 'Recorded by Time',
            damLevel: (4.0 + Math.random() * 0.5).toFixed(2),
            waterFlow: (150 + Math.random() * 50).toFixed(2),
            reservoirCapacity: (75 + Math.random() * 10).toFixed(1),
        });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        rows: dummyData.slice(startIndex, endIndex),
        total: dummyData.length,
    };
}

/** Download a file from the export API */
async function downloadExport(format: 'pdf' | 'excel', options: ExportOptions) {
    // TODO: Replace with actual API endpoint when available
    console.log('Exporting Vyasi Dam data in', format, options);
    throw new Error('Export API endpoint not implemented yet');
}

export default function VyasiDamPage() {
    const [liveStations, setLiveStations] = useState<Array<{ id: string; title: string; chartKey: string }> | null>(null);

    useEffect(() => {
        // TODO: Replace with actual API call to fetch dam names
        setLiveStations([{ id: 'vyasi-dam', title: 'Vyasi Dam', chartKey: 'VD' }]);
    }, []);

    if (!liveStations) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-gray-800 text-sm font-semibold tracking-wide">Loading dam data...</span>
                </div>
            </div>
        );
    }

    return (
        <ReportPage
            config={vyasiDamConfig}
            fetchData={fetchVyasiDamData}
            liveStations={liveStations}
            onExportPdf={(opts) => downloadExport('pdf', opts)}
            onExportExcel={(opts) => downloadExport('excel', opts)}
        />
    );
}
