import StatisticsChart from '../StatisticsChart';
import type { RainGaugeStatisticsData } from '../../types';

interface RainGaugeStatisticsProps {
    highlightedKeys?: string[];
    selectedTitles?: string[];
    statisticsData?: RainGaugeStatisticsData;  // Live API data from parent
}

export default function RainGaugeStatistics({ highlightedKeys = [], selectedTitles = [], statisticsData }: RainGaugeStatisticsProps) {
    if (!statisticsData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-semibold">No data available</span>
            </div>
        );
    }

    const rainGaugeStats = statisticsData;

    return (
        <div className="flex flex-col min-h-0 h-full">
            <div className="flex items-center gap-2 2xl:gap-3 mb-2 2xl:mb-3 flex-wrap">
                <h2 className="text-xl 2xl:text-3xl font-bold" style={{ color: '#303030' }}>
                    {rainGaugeStats.sectionTitle}
                </h2>
                {selectedTitles.map((title, index) => (
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
            <div className="grid grid-rows-2 gap-2 2xl:gap-3 flex-1 overflow-hidden">
                <StatisticsChart
                    title={rainGaugeStats.charts.rainfallHR.title}
                    data={rainGaugeStats.charts.rainfallHR.data}
                    maxValue={rainGaugeStats.maxValue}
                    highlightedKeys={highlightedKeys}
                />
                <StatisticsChart
                    title={rainGaugeStats.charts.rainfallTotal.title}
                    data={rainGaugeStats.charts.rainfallTotal.data}
                    maxValue={rainGaugeStats.maxValue}
                    highlightedKeys={highlightedKeys}
                />
            </div>
        </div>
    );
}
