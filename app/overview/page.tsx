'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header, { type TabType } from '../components/Header';
import MetricCard from '../components/MetricCard';
import StatisticsChart from '../components/StatisticsChart';
import SkeletonCard from '../components/SkeletonCard';
import SkeletonChart from '../components/SkeletonChart';
import DischargeStationsContent from '../components/content/DischargeStationsContent';
import AutomaticWeatherContent from '../components/content/AutomaticWeatherContent';
import RainGaugeContent from '../components/content/RainGaugeContent';
import WeatherStatistics from '../components/content/WeatherStatistics';
import RainGaugeStatistics from '../components/content/RainGaugeStatistics';
import { fetchAllDashboardData, type AllDashboardData } from '../services/dataService';
import { useAutoLoop } from '../hooks/useAutoLoop';

// Tab configuration for auto-loop (only loops through main content tabs)
const LOOP_TABS: TabType[] = ['discharge', 'weather', 'rain-gauge'];
const TAB_LABELS: Record<TabType, string> = {
    'overview': 'Overview',
    'discharge': 'Discharge Stations',
    'weather': 'Automatic Weather Stations',
    'rain-gauge': 'Rain Gauge Stations',
    'map': 'Map',
};

function OverviewContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedStations, setSelectedStations] = useState<{ chartKeys: string[]; titles: string[] }>({
        chartKeys: [],
        titles: []
    });
    const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [data, setData] = useState<AllDashboardData | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch data — used for both initial load and polling
    const loadData = useCallback(async (isInitial: boolean) => {
        if (isInitial) setIsLoading(true);
        try {
            const allData = await fetchAllDashboardData();
            setData(allData);
            setApiError(null); // Clear any previous error on success
        } catch (error: any) {
            console.error('Failed to load dashboard data:', error);
            setApiError(error?.message || 'Data not received – API failed');
            // On initial load with error, keep data null so skeleton doesn't show stale data
            // On polling with error, keep existing data so UI doesn't blank out
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, []);

    // Initial fetch + 5-minute polling
    useEffect(() => {
        loadData(true);

        const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
        const intervalId = setInterval(() => {
            loadData(false);
        }, POLL_INTERVAL);

        return () => clearInterval(intervalId);
    }, [loadData]);

    // Auto-select tab and station from query params
    useEffect(() => {
        const tabParam = searchParams?.get('tab');
        const stationParam = searchParams?.get('station');
        if (tabParam === 'aws' && stationParam) {
            setActiveTab('weather');
            setSelectedStations({ chartKeys: [stationParam], titles: [stationParam] });
        }
    }, [searchParams]);

    // Handle tab change with callback - now includes loading state
    const handleTabChange = useCallback((tab: TabType | string) => {
        const newTab = tab as TabType;
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            // Reset station and parameter selection when changing tabs
            setSelectedStations({ chartKeys: [], titles: [] });
            setSelectedParameters([]);
            // Trigger loading for tab content
            setIsTabLoading(true);
            setTimeout(() => {
                setIsTabLoading(false);
            }, 2000);
        }
    }, [activeTab]);

    // Auto-loop hook for large screens
    const { isLooping, isLargeScreen, timeUntilLoop } = useAutoLoop({
        inactivityTimeout: 30000, // 30 seconds inactivity
        tabDuration: 30000, // 30 seconds per tab
        minScreenWidth: 2500, // ~55" screens
        tabs: LOOP_TABS,
        onTabChange: handleTabChange,
        currentTab: activeTab,
    });

    // Determine which metric card should be active based on tab
    const getActiveMetric = () => {
        switch (activeTab) {
            case 'discharge':
                return 'discharge';
            case 'weather':
                return 'weather';
            case 'rain-gauge':
                return 'rain-gauge';
            default:
                return 'discharge'; // Overview shows discharge as primary
        }
    };

    const activeMetric = getActiveMetric();

    // Handle station selection (toggle for multi-select)
    const handleStationSelect = (chartKey: string | null, title: string | null) => {
        if (!chartKey || !title) {
            // Clear all selections if null passed
            setSelectedStations({ chartKeys: [], titles: [] });
            return;
        }

        setSelectedStations(prev => {
            const keyIndex = prev.chartKeys.indexOf(chartKey);
            if (keyIndex > -1) {
                // Remove if already selected
                return {
                    chartKeys: prev.chartKeys.filter(k => k !== chartKey),
                    titles: prev.titles.filter((_, i) => i !== keyIndex)
                };
            } else {
                // Add to selection
                return {
                    chartKeys: [...prev.chartKeys, chartKey],
                    titles: [...prev.titles, title]
                };
            }
        });
    };

    // Render content based on active tab
    const renderContent = () => {
        const showLoading = isLoading || isTabLoading;
        if (showLoading) {
            const cardType = activeTab === 'weather' ? 'weather' : activeTab === 'rain-gauge' ? 'rain-gauge' : 'discharge';
            const cardCount = activeTab === 'weather' ? 3 : activeTab === 'rain-gauge' ? 9 : 8;
            const cols = activeTab === 'rain-gauge' ? 3 : 2;

            return (
                <div className="flex flex-col min-h-0 h-full overflow-hidden">
                    <div className="h-6 2xl:h-8 w-48 bg-gray-300 rounded mb-2 2xl:mb-3 animate-pulse" />
                    <div className={`grid grid-cols-${cols} gap-1.5 2xl:gap-2 flex-1 overflow-hidden`}
                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {Array.from({ length: cardCount }).map((_, i) => (
                            <SkeletonCard key={i} type={cardType} />
                        ))}
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'weather':
                return <AutomaticWeatherContent
                    onStationSelect={handleStationSelect}
                    selectedChartKeys={selectedStations.chartKeys}
                    onClearAll={() => {
                        setSelectedStations({ chartKeys: [], titles: [] });
                        setSelectedParameters([]);
                    }}
                    selectedParameters={selectedParameters}
                    onParameterSelect={(paramKey) => {
                        setSelectedParameters(prev =>
                            prev.includes(paramKey)
                                ? prev.filter(k => k !== paramKey)
                                : [...prev, paramKey]
                        );
                    }}
                    stationsData={data?.weatherStations}
                />;
            case 'rain-gauge':
                return <RainGaugeContent
                    onStationSelect={handleStationSelect}
                    selectedChartKeys={selectedStations.chartKeys}
                    onClearAll={() => setSelectedStations({ chartKeys: [], titles: [] })}
                    stationsData={data?.rainGaugeStations}
                />;
            case 'discharge':
            case 'overview':
            default:
                return <DischargeStationsContent
                    onStationSelect={handleStationSelect}
                    selectedChartKeys={selectedStations.chartKeys}
                    onClearAll={() => setSelectedStations({ chartKeys: [], titles: [] })}
                    stationsData={data?.dischargeStations}
                />;
        }
    };

    // Render statistics based on active tab
    const renderStatistics = () => {
        const showLoading = isLoading || isTabLoading;
        if (showLoading) {
            const chartCount = activeTab === 'weather' ? 9 : activeTab === 'rain-gauge' ? 2 : 3;
            const cols = activeTab === 'weather' ? 3 : 1;

            return (
                <div className="flex flex-col min-h-0 h-full ">
                    <div className="h-6 2xl:h-8 w-32 bg-gray-300 rounded mb-2 2xl:mb-3 animate-pulse" />
                    <div className={`grid gap-2 2xl:gap-3 flex-1 `}
                        style={{
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gridTemplateRows: `repeat(${Math.ceil(chartCount / cols)}, 1fr)`
                        }}>
                        {Array.from({ length: chartCount }).map((_, i) => (
                            <SkeletonChart key={i} compact={activeTab === 'weather'} />
                        ))}
                    </div>
                </div>
            );
        }

        if (!data) return null;

        if (activeTab === 'weather') {
            return <WeatherStatistics
                highlightedKeys={selectedStations.chartKeys}
                selectedTitles={selectedStations.titles}
                selectedParameters={selectedParameters}
                statisticsData={data?.weatherStatistics}
            />;
        }

        if (activeTab === 'rain-gauge') {
            return <RainGaugeStatistics
                highlightedKeys={selectedStations.chartKeys}
                selectedTitles={selectedStations.titles}
                statisticsData={data?.rainGaugeStatistics}
            />;
        }

        const statisticsData = data.dischargeStatistics;

        return (
            <div className="flex flex-col min-h-0 h-full">
                <div className="flex items-center gap-2 2xl:gap-3 mb-2 2xl:mb-3 flex-wrap">
                    <h2 className="text-2xl 2xl:text-4xl font-bold" style={{ color: '#303030' }}>
                        {statisticsData.sectionTitle}
                    </h2>
                    {selectedStations.titles.map((title, index) => (
                        <span
                            key={index}
                            className="px-2 2xl:px-3 py-0.5 2xl:py-1 rounded-full text-xs 2xl:text-sm font-semibold"
                            style={{
                                backgroundColor: 'rgba(124, 58, 237, 0.15)',
                                color: '#7C3AED'
                            }}
                        >
                            {title}
                        </span>
                    ))}
                </div>
                <div className="grid grid-rows-3 gap-2 2xl:gap-3 flex-1 overflow-hidden border-none">
                    <StatisticsChart
                        title={statisticsData.charts.discharge.title}
                        data={statisticsData.charts.discharge.data}
                        maxValue={statisticsData.charts.discharge.maxValue}
                        highlightedKeys={selectedStations.chartKeys}
                    />
                    <StatisticsChart
                        title={statisticsData.charts.velocity.title}
                        data={statisticsData.charts.velocity.data}
                        maxValue={statisticsData.charts.velocity.maxValue}
                        highlightedKeys={selectedStations.chartKeys}
                    />
                    <StatisticsChart
                        title={statisticsData.charts.waterLevel.title}
                        data={statisticsData.charts.waterLevel.data}
                        maxValue={statisticsData.charts.waterLevel.maxValue}
                        highlightedKeys={selectedStations.chartKeys}
                    />
                </div>
            </div>
        );
    };

    // Get metrics from data or use loading placeholders
    const metrics = data?.dashboard.metrics ?? [
        { id: 'discharge', title: 'Discharge Stations', value: '--', clickable: true },
        { id: 'weather', title: 'Automatic Weather Stations', value: '--', clickable: true },
        { id: 'rain-gauge', title: 'Rain Gauge Stations', value: '--', clickable: true },
        { id: 'juddo-pond', title: 'Juddo Pond Level', value: '--', clickable: false },
        { id: 'juddo-forebay', title: 'Juddo Forebay Level', value: '--', clickable: false },
    ];
    const lastUpdated = data?.dashboard.lastUpdated ?? { date: '--', time: '--' };

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
            <Header onTabChange={handleTabChange} />

            <main className="flex-1 px-4 2xl:px-6 py-2 2xl:py-3 overflow-hidden">
                <div className="h-full flex flex-col gap-2 2xl:gap-3">
                    {/* Metrics Row */}
                    <div className="flex gap-2 2xl:gap-3">
                        <div className="flex-1 grid grid-cols-5 gap-2 2xl:gap-3">
                            {metrics.map((metric) => (
                                <MetricCard
                                    key={metric.id}
                                    title={metric.title}
                                    value={isLoading ? '--' : metric.value}
                                    isActive={activeMetric === metric.id}
                                    onClick={metric.clickable ? () => handleTabChange(metric.id as TabType) : undefined}
                                />
                            ))}
                        </div>
                        {/* Last Updated Card */}
                        <div
                            className="rounded-xl px-5 py-2 min-w-[20%] flex flex-col justify-center items-center text-center"
                            style={{ backgroundColor: '#f7f7f7' }}
                        >
                            <span className="text-md 2xl:text-lg font-semibold text-gray-500 mb-0.5">
                                Last Updated:
                            </span>
                            <div className="flex items-center gap-1 2xl:gap-1.5">
                                <Image src="/calendar.svg" alt="calendar" width={20} height={20} className="2xl:w-50px 2xl:h-50px" />
                                <span className={`text-md 2xl:text-md font-semibold ${isLoading ? 'animate-pulse' : ''}`} style={{ color: '#4B5563' }}>
                                    {lastUpdated.date}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 2xl:gap-1.5">
                                <Image src="/clock.svg" alt="time" width={18} height={18} className="2xl:w-[22px] 2xl:h-[22px]" />
                                <span className={`text-md 2xl:text-lg font-semibold ${isLoading ? 'animate-pulse' : ''}`}>
                                    {lastUpdated.time}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* API Error Banner */}
                    {apiError && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-red-700 flex-1">Data not received – API failed</span>
                            <button
                                onClick={() => loadData(true)}
                                className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 grid grid-cols-2 gap-3 2xl:gap-4 overflow-hidden">
                        {/* Left Panel - Station Cards */}
                        <div
                            className="rounded-xl 2xl:rounded-2xl p-3 2xl:p-4 overflow-hidden flex flex-col"
                            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
                        >
                            {renderContent()}
                        </div>

                        {/* Right Panel - Statistics */}
                        <div
                            className="rounded-xl 2xl:rounded-2xl p-3 2xl:p-4 overflow-hidden flex flex-col"
                            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
                        >
                            {renderStatistics()}
                        </div>
                    </div>
                </div>
            </main>

            {/* Auto-loop indicator for large screens */}
            {isLargeScreen && (
                <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
                    {isLooping ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-gray-600">
                                Auto-cycling: {TAB_LABELS[activeTab]}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium text-gray-600">
                                Auto-cycle in {Math.ceil(timeUntilLoop / 1000)}s
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Overview() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-gray-800 text-sm font-semibold tracking-wide">Loading...</span>
                </div>
            </div>
        }>
            <OverviewContent />
        </Suspense>
    );
}