// Station Data Generator Service
// Generates dummy data based on report type, station, and time tab

import dischargeStations from '../data/dischargeStations.json';
import weatherStations from '../data/weatherStations.json';
import rainGaugeStations from '../data/rainGaugeStations.json';

export type ReportType = 'discharge' | 'aws' | 'rain-gauge';
export type TimeTab = 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | 'All';

export interface Station {
    id: string;
    title: string;
    chartKey: string;
}

export interface TableColumn {
    key: string;
    label: string;
    align: 'left' | 'center' | 'right';
}

export interface TableRow {
    id: number;
    timestamp: string;
    utcTime: string;
    milliseconds: number;
    user: number;
    reason: string;
    [key: string]: string | number;
}

// Get stations by report type
export function getStationsByType(type: ReportType): Station[] {
    switch (type) {
        case 'discharge':
            return dischargeStations.stations.map(s => ({
                id: s.id,
                title: s.title,
                chartKey: s.chartKey
            }));
        case 'aws':
            return weatherStations.stations.map(s => ({
                id: s.id,
                title: s.title,
                chartKey: s.chartKey
            }));
        case 'rain-gauge':
            return rainGaugeStations.stations.map(s => ({
                id: s.id,
                title: s.title,
                chartKey: s.chartKey
            }));
    }
}

// Get table columns by report type
export function getColumnsByType(type: ReportType, stationName: string): TableColumn[] {
    const baseColumns: TableColumn[] = [
        { key: 'utcTime', label: 'Utc TimeCol', align: 'left' },
        { key: 'timestamp', label: 'Timestamp', align: 'left' },
        { key: 'milliseconds', label: 'MillisecondsCol', align: 'center' },
        { key: 'user', label: 'UserCol', align: 'center' },
        { key: 'reason', label: 'ReasonCol', align: 'center' },
    ];

    const prefix = stationName.replace(/\s+/g, '_');

    switch (type) {
        case 'discharge':
            return [
                ...baseColumns,
                { key: 'discharge', label: `${prefix}_Discharge`, align: 'center' },
                { key: 'velocity', label: `${prefix}_Velocity`, align: 'center' },
                { key: 'waterLevel', label: `${prefix}_WaterLevel`, align: 'center' },
                { key: 'flowRate', label: `${prefix}_FlowRate`, align: 'center' },
            ];
        case 'aws':
            return [
                ...baseColumns,
                { key: 'humidity', label: `${prefix}_Humidity`, align: 'center' },
                { key: 'pressure', label: `${prefix}_Pressure`, align: 'center' },
                { key: 'temperature', label: `${prefix}_Temperature`, align: 'center' },
                { key: 'windSpeed', label: `${prefix}_WindSpeed`, align: 'center' },
            ];
        case 'rain-gauge':
            return [
                ...baseColumns,
                { key: 'rainfallHr', label: `${prefix}_Rainfall_Hr`, align: 'center' },
                { key: 'rainfallTotal', label: `${prefix}_Rainfall_Total`, align: 'center' },
                { key: 'rainfallDay', label: `${prefix}_Rainfall_Day`, align: 'center' },
                { key: 'intensity', label: `${prefix}_Intensity`, align: 'center' },
            ];
    }
}

// Get row count by time tab
function getRowCountByTab(tab: TimeTab): number {
    switch (tab) {
        case 'Minute': return 60;
        case 'Hour': return 24;
        case 'Day': return 30;
        case 'Week': return 12;
        case 'Month': return 12;
        case 'Year': return 5;
        case 'All': return 50;
    }
}

// Get time interval in milliseconds by tab
function getIntervalByTab(tab: TimeTab): number {
    switch (tab) {
        case 'Minute': return 60000; // 1 minute
        case 'Hour': return 3600000; // 1 hour
        case 'Day': return 86400000; // 1 day
        case 'Week': return 604800000; // 1 week
        case 'Month': return 2592000000; // ~30 days
        case 'Year': return 31536000000; // 1 year
        case 'All': return 86400000; // 1 day for all
    }
}

// Generate data based on report type with time filtering
export function generateStationData(
    type: ReportType,
    stationId: string,
    tab: TimeTab,
    startTime?: Date,
    endTime?: Date
): TableRow[] {
    // Use provided times or defaults
    const now = new Date();
    const end = endTime || now;
    const start = startTime || new Date(end.getTime() - getIntervalByTab(tab) * getRowCountByTab(tab));

    // Calculate time range
    const timeRange = end.getTime() - start.getTime();

    // Determine interval based on tab or time range
    let interval: number;
    let rowCount: number;

    switch (tab) {
        case 'Minute':
            interval = 60000; // 1 minute
            rowCount = Math.min(Math.ceil(timeRange / interval), 1000);
            break;
        case 'Hour':
            interval = 3600000; // 1 hour
            rowCount = Math.min(Math.ceil(timeRange / interval), 168); // max 1 week in hours
            break;
        case 'Day':
            interval = 86400000; // 1 day
            rowCount = Math.min(Math.ceil(timeRange / interval), 7); // max 1 week in days
            break;
        case 'Week':
            interval = 604800000; // 1 week
            rowCount = Math.min(Math.ceil(timeRange / interval), 1);
            break;
        case 'Month':
            interval = 2592000000; // ~30 days
            rowCount = 1; // max 1 week won't have full months
            break;
        case 'Year':
            interval = 31536000000; // 1 year
            rowCount = 1;
            break;
        case 'All':
        default:
            // For 'All', use minute intervals if range is small, hour if larger
            if (timeRange <= 3600000) {
                interval = 60000; // 1 minute
            } else if (timeRange <= 86400000) {
                interval = 3600000; // 1 hour
            } else {
                interval = 86400000; // 1 day
            }
            rowCount = Math.min(Math.ceil(timeRange / interval), 500);
            break;
    }

    // Ensure at least 1 row
    rowCount = Math.max(rowCount, 1);

    // Use station ID for consistent random seed
    const seed = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const data: TableRow[] = [];

    for (let i = 0; i < rowCount; i++) {
        const timestamp = new Date(start.getTime() + i * interval);

        // Stop if we exceed end time
        if (timestamp > end) break;

        const randomFactor = (seed + i) % 100 / 100;

        const baseRow: TableRow = {
            id: i,
            timestamp: timestamp.toLocaleString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }),
            utcTime: timestamp.toISOString(),
            milliseconds: timestamp.getMilliseconds(),
            user: 0,
            reason: 'Recorded by Time',
        };

        // Add type-specific data
        switch (type) {
            case 'discharge':
                baseRow.discharge = (10 + randomFactor * 20).toFixed(2);
                baseRow.velocity = (1.5 + randomFactor * 2).toFixed(2);
                baseRow.waterLevel = (2 + randomFactor * 3).toFixed(2);
                baseRow.flowRate = (50 + randomFactor * 100).toFixed(2);
                break;
            case 'aws':
                baseRow.humidity = (30 + randomFactor * 40).toFixed(2);
                baseRow.pressure = (860 + randomFactor * 20).toFixed(2);
                baseRow.temperature = (15 + randomFactor * 20).toFixed(2);
                baseRow.windSpeed = (2 + randomFactor * 10).toFixed(2);
                baseRow.rainfallDay = (randomFactor * 10).toFixed(2);
                baseRow.rainfallHr = (randomFactor * 5).toFixed(2);
                baseRow.solarRadiation = (100 + randomFactor * 500).toFixed(2);
                break;
            case 'rain-gauge':
                baseRow.rainfallHr = (randomFactor * 15).toFixed(2);
                baseRow.rainfallTotal = (100 + randomFactor * 100).toFixed(2);
                baseRow.rainfallDay = (randomFactor * 30).toFixed(2);
                baseRow.intensity = (randomFactor * 20).toFixed(2);
                break;
        }

        data.push(baseRow);
    }

    return data;
}

// Get report type display name
export function getReportTypeName(type: ReportType): string {
    switch (type) {
        case 'discharge': return 'Discharge';
        case 'aws': return 'AWS';
        case 'rain-gauge': return 'Rain Gauge';
    }
}
