/**
 * Data Service
 * 
 * This service provides functions to fetch data from JSON files.
 * In production, these functions can be easily replaced with API calls.
 */

import type {
    DashboardData,
    DischargeStationsData,
    WeatherStationsData,
    RainGaugeStationsData,
    StatisticsData,
    WeatherStatisticsData,
    RainGaugeStatisticsData,
} from '../types';

// Import JSON data
import dashboardData from '../data/dashboard.json';
import dischargeStationsData from '../data/dischargeStations.json';
import weatherStationsData from '../data/weatherStations.json';
import rainGaugeStationsData from '../data/rainGaugeStations.json';
import statisticsData from '../data/statistics.json';

// Default delay for simulating API calls (2 seconds)
const API_DELAY = 2000;

/**
 * Helper function to simulate API delay
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== SYNCHRONOUS FUNCTIONS (for backwards compatibility) =====

export function getDashboardData(): DashboardData {
    return dashboardData as DashboardData;
}

export function getDischargeStations(): DischargeStationsData {
    return dischargeStationsData as DischargeStationsData;
}

export function getWeatherStations(): WeatherStationsData {
    return weatherStationsData as WeatherStationsData;
}

export function getRainGaugeStations(): RainGaugeStationsData {
    return rainGaugeStationsData as RainGaugeStationsData;
}

export function getDischargeStatistics(): StatisticsData {
    return statisticsData.discharge as StatisticsData;
}

export function getWeatherStatistics(): WeatherStatisticsData {
    return statisticsData.weather as WeatherStatisticsData;
}

export function getRainGaugeStatistics(): RainGaugeStatisticsData {
    return statisticsData.rainGauge as RainGaugeStatisticsData;
}

// ===== ASYNC FUNCTIONS (with simulated API delay) =====

export async function fetchDashboardData(): Promise<DashboardData> {
    await delay(API_DELAY);
    return dashboardData as DashboardData;
}

export async function fetchDischargeStations(): Promise<DischargeStationsData> {
    await delay(API_DELAY);
    return dischargeStationsData as DischargeStationsData;
}

export async function fetchWeatherStations(): Promise<WeatherStationsData> {
    await delay(API_DELAY);
    return weatherStationsData as WeatherStationsData;
}

export async function fetchRainGaugeStations(): Promise<RainGaugeStationsData> {
    await delay(API_DELAY);
    return rainGaugeStationsData as RainGaugeStationsData;
}

export async function fetchDischargeStatistics(): Promise<StatisticsData> {
    await delay(API_DELAY);
    return statisticsData.discharge as StatisticsData;
}

export async function fetchWeatherStatistics(): Promise<WeatherStatisticsData> {
    await delay(API_DELAY);
    return statisticsData.weather as WeatherStatisticsData;
}

export async function fetchRainGaugeStatistics(): Promise<RainGaugeStatisticsData> {
    await delay(API_DELAY);
    return statisticsData.rainGauge as RainGaugeStatisticsData;
}

// ===== OVERVIEW SUMMARY API =====

export interface OverviewSummaryResponse {
    status: number;
    message: string;
    tab: string;
    entity: {
        discharge_stations: number;
        aws: number;
        rain_gauge_stations: number;
        juddo_pond_level: number;
        juddo_forbay_level: number;
    };
}

/**
 * Fetch overview summary from the live API.
 * Maps the API response to the metrics format used by the dashboard.
 * Falls back to local JSON data if the API call fails.
 */
export async function fetchOverviewSummary(): Promise<DashboardData> {
    try {
        const res = await fetch('/api/external/overview/summary');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json: OverviewSummaryResponse = await res.json();

        const pad = (n: number) => String(n).padStart(2, '0');

        return {
            metrics: [
                { id: 'discharge', title: 'Discharge Stations', value: pad(json.entity.discharge_stations), clickable: true },
                { id: 'weather', title: 'Automatic Weather Stations', value: pad(json.entity.aws), clickable: true },
                { id: 'rain-gauge', title: 'Rain Gauge Stations', value: pad(json.entity.rain_gauge_stations), clickable: true },
                { id: 'juddo-pond', title: 'Juddo Pond Level', value: pad(json.entity.juddo_pond_level), clickable: false },
                { id: 'juddo-forebay', title: 'Juddo Forebay Level', value: pad(json.entity.juddo_forbay_level), clickable: false },
            ],
            lastUpdated: {
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
        };
    } catch (error) {
        console.error('Failed to fetch overview summary from API:', error);
        throw new Error('Failed to fetch overview summary. API not responding.');
    }
}

/**
 * Fetch discharge stations data from the live API.
 * Maps the API response to the DischargeStationsData format.
 * Falls back to local JSON data if the API call fails.
 */
export async function fetchDischargeStationsFromAPI(): Promise<DischargeStationsData> {
    const COLORS: Array<'blue' | 'orange' | 'green' | 'yellow'> = ['blue', 'orange', 'green', 'yellow'];

    try {
        const res = await fetch('/api/external/overview/discharge_stations');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        const stations = (json.entity as Array<{
            name: string;
            discharge: number;
            velocity: number;
            water_level: number;
        }>).map((s, i) => {
            // Generate a short chartKey from the station name
            const chartKey = s.name
                .split(' ')
                .map((w: string) => w[0]?.toUpperCase() ?? '')
                .join('');

            return {
                id: `ds-${String(i + 1).padStart(3, '0')}`,
                title: s.name,
                chartKey,
                discharge: s.discharge.toFixed(2),
                velocity: s.velocity.toFixed(2),
                waterLevel: s.water_level.toFixed(2),
                color: COLORS[i % COLORS.length] as 'blue' | 'orange' | 'green' | 'yellow',
            };
        });

        return {
            sectionTitle: 'Discharge Stations',
            stations,
        };
    } catch (error) {
        console.error('Failed to fetch discharge stations from API:', error);
        throw new Error('Failed to fetch discharge stations. API not responding.');
    }
}

/**
 * Fetch AWS (Automatic Weather Stations) data from the live API.
 * Falls back to local JSON data if the API call fails.
 */
export async function fetchAWSFromAPI(): Promise<WeatherStationsData> {
    const COLORS: Array<'blue' | 'green' | 'orange'> = ['blue', 'green', 'orange'];

    try {
        const res = await fetch('/api/external/overview/aws');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        const fmt = (v: number) => v.toFixed(2);

        const stations = (json.entity as Array<{
            station_name: string;
            temperature: number;
            humidity: number;
            pressure: number;
            wind_speed: number;
            wind_direction: number;
            rainfall_day: number;
            rainfall_hour: number;
            rainfall_total: number;
        }>).map((s, i) => ({
            id: `ws-${String(i + 1).padStart(3, '0')}`,
            title: s.station_name,
            chartKey: s.station_name,
            color: COLORS[i % COLORS.length] as 'blue' | 'green' | 'orange',
            windSpeed: fmt(s.wind_speed),
            windDirection: fmt(s.wind_direction),
            temperature: fmt(s.temperature),
            relativeHumidity: fmt(s.humidity),
            airPressure: fmt(s.pressure),
            solarRadiation: '0.00',
            rainfallHR: fmt(s.rainfall_hour),
            rainfallDay: fmt(s.rainfall_day),
            rainfallTotal: fmt(s.rainfall_total),
        }));

        return {
            sectionTitle: 'Automatic Weather Stations',
            stations,
        };
    } catch (error) {
        console.error('Failed to fetch AWS from API:', error);
        throw new Error('Failed to fetch weather stations. API not responding.');
    }
}

/**
 * Fetch Rain Gauge stations data from the live API.
 * Falls back to local JSON data if the API call fails.
 */
export async function fetchRainGaugesFromAPI(): Promise<RainGaugeStationsData> {
    const COLORS: Array<'blue' | 'green' | 'orange' | 'yellow'> = ['blue', 'green', 'orange', 'yellow'];

    try {
        const res = await fetch('/api/external/overview/rain_gauges');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        const fmt = (v: number) => v.toFixed(2);

        const stations = (json.entity as Array<{
            name: string;
            hour: number;
            total: number;
        }>).map((s, i) => {
            // Generate a short chartKey from the station name
            const words = s.name.replace(/([A-Z])/g, ' $1').trim().split(/\s+/);
            const chartKey = words.length > 1
                ? words.map(w => w[0]?.toUpperCase() ?? '').join('')
                : s.name.substring(0, 2);

            return {
                id: `rg-${String(i + 1).padStart(3, '0')}`,
                title: s.name,
                chartKey,
                color: COLORS[i % COLORS.length] as 'blue' | 'green' | 'orange' | 'yellow',
                rainfallHR: fmt(s.hour),
                rainfallTotal: fmt(s.total),
            };
        });

        return {
            sectionTitle: 'Rain Gauge Stations',
            stations,
        };
    } catch (error) {
        console.error('Failed to fetch rain gauges from API:', error);
        throw new Error('Failed to fetch rain gauge stations. API not responding.');
    }
}

// ===== ALL DATA FETCH (single call for initial load) =====

export interface AllDashboardData {
    dashboard: DashboardData;
    dischargeStations: DischargeStationsData;
    weatherStations: WeatherStationsData;
    rainGaugeStations: RainGaugeStationsData;
    dischargeStatistics: StatisticsData;
    weatherStatistics: WeatherStatisticsData;
    rainGaugeStatistics: RainGaugeStatisticsData;
}

/**
 * Build discharge statistics charts from live station data.
 * Each station's chartKey becomes the bar label, actual values become bar values.
 */
function buildDischargeStatisticsFromStations(stations: DischargeStationsData): StatisticsData {
    const stationList = stations.stations;

    const buildChart = (title: string, getValue: (s: typeof stationList[0]) => number) => {
        const data = stationList.map(s => ({
            name: s.chartKey,
            value: parseFloat(getValue(s).toString()),
        }));
        const maxVal = Math.max(...data.map(d => d.value));
        return {
            title,
            data,
            maxValue: Math.ceil(maxVal * 1.2), // 20% headroom, rounded up
        };
    };

    return {
        sectionTitle: 'Statistics',
        charts: {
            discharge: buildChart('Discharge', s => parseFloat(s.discharge)),
            velocity: buildChart('Velocity', s => parseFloat(s.velocity)),
            waterLevel: buildChart('Water Level', s => parseFloat(s.waterLevel)),
        },
    };
}

/**
 * Build weather statistics charts from live AWS station data.
 */
function buildWeatherStatisticsFromStations(stations: WeatherStationsData): WeatherStatisticsData {
    const stationList = stations.stations;

    const buildChart = (title: string, getValue: (s: typeof stationList[0]) => number) => {
        const data = stationList.map(s => ({
            name: s.chartKey,
            value: parseFloat(getValue(s).toString()),
        }));
        const maxVal = Math.max(...data.map(d => d.value), 1);
        return {
            title,
            data,
            maxValue: Math.ceil(maxVal * 1.2),
        };
    };

    return {
        sectionTitle: 'Statistics',
        charts: {
            windSpeed: buildChart('Wind Speed', s => parseFloat(s.windSpeed)),
            windDirection: buildChart('Wind Direction', s => parseFloat(s.windDirection)),
            temperature: buildChart('Temperature', s => parseFloat(s.temperature)),
            relativeHumidity: buildChart('Humidity', s => parseFloat(s.relativeHumidity)),
            airPressure: buildChart('Air Pressure', s => parseFloat(s.airPressure)),
            solarRadiation: buildChart('Solar Radiation', s => parseFloat(s.solarRadiation)),
            rainfallHR: buildChart('Rainfall HR', s => parseFloat(s.rainfallHR)),
            rainfallDay: buildChart('Rainfall Day', s => parseFloat(s.rainfallDay)),
            rainfallTotal: buildChart('Rainfall Total', s => parseFloat(s.rainfallTotal)),
        },
        maxValue: 500,
    };
}

/**
 * Build rain gauge statistics charts from live station data.
 */
function buildRainGaugeStatisticsFromStations(stations: RainGaugeStationsData): RainGaugeStatisticsData {
    const stationList = stations.stations;

    const buildChart = (title: string, getValue: (s: typeof stationList[0]) => number) => {
        const data = stationList.map(s => ({
            name: s.chartKey,
            value: parseFloat(getValue(s).toString()),
        }));
        const maxVal = Math.max(...data.map(d => d.value), 1);
        return {
            title,
            data,
            maxValue: Math.ceil(maxVal * 1.2),
        };
    };

    return {
        sectionTitle: 'Statistics',
        charts: {
            rainfallHR: buildChart('Rainfall - HR (mm)', s => parseFloat(s.rainfallHR)),
            rainfallTotal: buildChart('Rainfall - Total (mm)', s => parseFloat(s.rainfallTotal)),
        },
        maxValue: 250,
    };
}

export async function fetchAllDashboardData(): Promise<AllDashboardData> {
    // Fetch all live API data in parallel
    const [liveDashboard, liveDischargeStations, liveWeatherStations, liveRainGaugeStations] = await Promise.all([
        fetchOverviewSummary(),
        fetchDischargeStationsFromAPI(),
        fetchAWSFromAPI(),
        fetchRainGaugesFromAPI(),
        delay(API_DELAY),
    ]);

    // Derive statistics from live station data
    const liveDischargeStatistics = buildDischargeStatisticsFromStations(liveDischargeStations);
    const liveWeatherStatistics = buildWeatherStatisticsFromStations(liveWeatherStations);
    const liveRainGaugeStatistics = buildRainGaugeStatisticsFromStations(liveRainGaugeStations);

    return {
        dashboard: liveDashboard,
        dischargeStations: liveDischargeStations,
        weatherStations: liveWeatherStations,
        rainGaugeStations: liveRainGaugeStations,
        dischargeStatistics: liveDischargeStatistics,
        weatherStatistics: liveWeatherStatistics,
        rainGaugeStatistics: liveRainGaugeStatistics,
    };
}

// ===== REPORT PAGE API FUNCTIONS =====

/**
 * Fetch live discharge station names from the overview API.
 * Returns Station[] compatible with the ReportPage's pill selector.
 */
export async function fetchDischargeStationNames(): Promise<Array<{ id: string; title: string; chartKey: string }>> {
    try {
        const res = await fetch('/api/external/overview/discharge_stations');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        return (json.entity as Array<{ name: string }>).map((s, i) => {
            const chartKey = s.name
                .split(' ')
                .map((w: string) => w[0]?.toUpperCase() ?? '')
                .join('');
            return {
                id: s.name,   // Use the station name as the ID so it can be sent directly to the report API
                title: s.name,
                chartKey,
            };
        });
    } catch (error) {
        console.error('Failed to fetch discharge station names:', error);
        // Fallback to local JSON names
        return (dischargeStationsData as DischargeStationsData).stations.map(s => ({
            id: s.title,
            title: s.title,
            chartKey: s.chartKey,
        }));
    }
}

/**
 * Fetch discharge station time-series report data from the API.
 * Makes a single API call. Passes selected station names as query params;
 * if no stations provided, returns data for all stations.
 * Returns { rows, total } to support server-side pagination.
 */
export async function fetchDischargeStationReport(
    stations: string[],
    startTime: string,
    endTime: string,
    page: number = 1,
    pageSize: number = 100,
): Promise<{ rows: Array<Record<string, string | number>>; total: number }> {
    const params = new URLSearchParams({
        start_time: startTime,
        end_time: endTime,
        page: String(page),
        page_size: String(pageSize),
    });

    // Add each selected station as a separate query param
    // If none selected, omit param to get all stations
    for (const station of stations) {
        params.append('stations', station);
    }

    const res = await fetch(`/api/external/discharge-stations?${params.toString()}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    const rows = (json.entity as Array<{
        timestamp: string;
        station: string;
        discharge: number;
        velocity: number;
        water_level: number;
    }>).map((row, i) => ({
        sno: (page - 1) * pageSize + i + 1,
        timestamp: row.timestamp,
        river: row.station,
        discharge: row.discharge.toFixed(2),
        velocity: row.velocity.toFixed(2),
        waterLevel: row.water_level.toFixed(2),
    }));

    return { rows, total: json.total ?? rows.length };
}

/**
 * Fetch live AWS station names from the overview API.
 * Returns Station[] compatible with the ReportPage's pill selector.
 */
export async function fetchAWSStationNames(): Promise<Array<{ id: string; title: string; chartKey: string }>> {
    try {
        const res = await fetch('/api/external/overview/aws');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        return (json.entity as Array<{ station_name: string }>).map((s) => {
            const chartKey = s.station_name
                .split(' ')
                .map((w: string) => w[0]?.toUpperCase() ?? '')
                .join('');
            return {
                id: s.station_name,
                title: s.station_name,
                chartKey,
            };
        });
    } catch (error) {
        console.error('Failed to fetch AWS station names:', error);
        return (weatherStationsData as WeatherStationsData).stations.map(s => ({
            id: s.title,
            title: s.title,
            chartKey: s.chartKey,
        }));
    }
}

/**
 * Fetch AWS station time-series report data from the API.
 * Single API call. Passes selected station names as query params;
 * if no stations provided, returns data for all stations.
 * Returns { rows, total } to support server-side pagination.
 */
export async function fetchAWSStationReport(
    stations: string[],
    startTime: string,
    endTime: string,
    page: number = 1,
    pageSize: number = 100,
): Promise<{ rows: Array<Record<string, string | number>>; total: number }> {
    const params = new URLSearchParams({
        start_time: startTime,
        end_time: endTime,
        page: String(page),
        page_size: String(pageSize),
    });

    // Add each selected station as a separate query param
    for (const station of stations) {
        params.append('stations', station);
    }

    const res = await fetch(`/api/external/aws-stations?${params.toString()}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    const rows = (json.entity as Array<{
        timestamp: string;
        station: string;
        temperature: number;
        humidity: number;
        pressure: number;
        wind_speed: number;
        wind_direction: number;
        rainfall_day: number;
        rainfall_hour: number;
        rainfall_total: number;
    }>).map((row, i) => ({
        sno: (page - 1) * pageSize + i + 1,
        timestamp: row.timestamp,
        station: row.station,
        temperature: row.temperature.toFixed(2),
        humidity: row.humidity.toFixed(2),
        pressure: row.pressure.toFixed(2),
        windSpeed: row.wind_speed.toFixed(2),
        windDirection: row.wind_direction.toFixed(2),
        rainfallDay: row.rainfall_day.toFixed(2),
        rainfallHour: row.rainfall_hour.toFixed(2),
        rainfallTotal: row.rainfall_total.toFixed(2),
    }));

    return { rows, total: json.total ?? rows.length };
}

/**
 * Fetch live rain gauge station names from the overview API.
 * Returns Station[] compatible with the ReportPage's pill selector.
 */
export async function fetchRainGaugeStationNames(): Promise<Array<{ id: string; title: string; chartKey: string }>> {
    try {
        const res = await fetch('/api/external/overview/rain_gauges');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        return (json.entity as Array<{ name: string }>).map((s) => {
            const words = s.name.replace(/([A-Z])/g, ' $1').trim().split(/\s+/);
            const chartKey = words.length > 1
                ? words.map(w => w[0]?.toUpperCase() ?? '').join('')
                : s.name.substring(0, 2);
            return {
                id: s.name,
                title: s.name,
                chartKey,
            };
        });
    } catch (error) {
        console.error('Failed to fetch rain gauge station names:', error);
        return (rainGaugeStationsData as RainGaugeStationsData).stations.map(s => ({
            id: s.title,
            title: s.title,
            chartKey: s.chartKey,
        }));
    }
}

/**
 * Fetch rain gauge station time-series report data from the API.
 * Single API call. Passes selected station names as query params;
 * if no stations provided, returns data for all stations.
 * Returns { rows, total } to support server-side pagination.
 */
export async function fetchRainGaugeStationReport(
    stations: string[],
    startTime: string,
    endTime: string,
    page: number = 1,
    pageSize: number = 100,
): Promise<{ rows: Array<Record<string, string | number>>; total: number }> {
    const params = new URLSearchParams({
        start_time: startTime,
        end_time: endTime,
        page: String(page),
        page_size: String(pageSize),
    });

    // Add each selected station as a separate query param
    for (const station of stations) {
        params.append('stations', station);
    }

    const res = await fetch(`/api/external/rain-gauge-stations/list?${params.toString()}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    const rows = (json.entity as Array<{
        timestamp: string;
        station: string;
        hour: number;
        total: number;
    }>).map((row, i) => ({
        sno: (page - 1) * pageSize + i + 1,
        timestamp: row.timestamp,
        station: row.station,
        rainfallHour: row.hour.toFixed(2),
        rainfallTotal: row.total.toFixed(2),
    }));

    return { rows, total: json.total ?? rows.length };
}
