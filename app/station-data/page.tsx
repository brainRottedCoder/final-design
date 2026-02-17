'use client';

import { useState, useEffect } from 'react';
import ReportPage, { type ReportPageConfig, type ExportOptions, type FetchDataResult } from '../components/ReportPage';
import { fetchDischargeStationReport, fetchDischargeStationNames } from '../services/dataService';
import type { TableRow } from '../services/stationDataGenerator';

const dischargeConfig: ReportPageConfig = {
    id: 'discharge',
    titleConfig: {
        reportType: 'discharge',
        title: 'Discharge Station Reports',
        badge: 'MULTI RIVER • TIME SERIES • EXPORT READY',
        stationLabel: 'Rivers',
        multiSelect: true,
    },
    columns: [
        { key: 'sno', label: 'S.No', align: 'center' },
        { key: 'timestamp', label: 'TimeStamp', align: 'left' },
        { key: 'river', label: 'River', align: 'left' },
        { key: 'discharge', label: 'Discharge (m3/s)', align: 'right' },
        { key: 'velocity', label: 'Velocity (m/s)', align: 'right' },
        { key: 'waterLevel', label: 'Water Level (m)', align: 'right' },
    ],
};

/** Format a Date to ISO string without timezone (e.g. 2026-02-09T00:00:00) */
const fmtDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function fetchDischargeData({
    stationIds,
    start,
    end,
    page,
    pageSize,
}: {
    stationId: string;
    stationIds: string[];
    start: Date;
    end: Date;
    page: number;
    pageSize: number;
}): Promise<FetchDataResult> {
    const result = await fetchDischargeStationReport(
        stationIds,
        fmtDate(start),
        fmtDate(end),
        page,
        pageSize,
    );
    return { rows: result.rows as TableRow[], total: result.total };
}

/** Download a file from the export API */
async function downloadExport(format: 'pdf' | 'excel', options: ExportOptions) {
    const params = new URLSearchParams({
        start_time: fmtDate(options.start),
        end_time: fmtDate(options.end),
    });

    for (const station of options.stationIds) {
        params.append('stations', station);
    }

    const url = `/api/external/discharge-stations/export/${format}?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Export API returned ${res.status}`);

    const blob = await res.blob();
    const ext = format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `discharge-station-report.${ext}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

export default function StationDataPage() {
    const [liveStations, setLiveStations] = useState<Array<{ id: string; title: string; chartKey: string }> | null>(null);

    useEffect(() => {
        fetchDischargeStationNames().then(setLiveStations);
    }, []);

    if (!liveStations) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-gray-800 text-sm font-semibold tracking-wide">Loading stations...</span>
                </div>
            </div>
        );
    }

    return (
        <ReportPage
            config={dischargeConfig}
            fetchData={fetchDischargeData}
            liveStations={liveStations}
            onExportPdf={(opts) => downloadExport('pdf', opts)}
            onExportExcel={(opts) => downloadExport('excel', opts)}
        />
    );
}