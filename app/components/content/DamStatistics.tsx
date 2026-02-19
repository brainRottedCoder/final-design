import StatisticsChart from '../StatisticsChart';
import type { DamStatisticsData } from '../../types';

interface DamStatisticsProps {
    data: DamStatisticsData;
    selectedMetrics?: string[];
}

export default function DamStatistics({ data, selectedMetrics }: DamStatisticsProps) {
    if (!data) return null;

    const { charts } = data;

    // Get the combined chart data for comparison
    const combinedData = charts.combined;

    return (
        <div className="flex flex-col min-h-0 h-full">
            <div className="flex items-center gap-2 2xl:gap-3 mb-2 2xl:mb-3 flex-wrap">
                <h2 className="text-xl 2xl:text-3xl font-bold" style={{ color: '#303030' }}>
                    {data.sectionTitle}
                </h2>
            </div>

            {/* Single Combined Chart for comparing all 4 values */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <StatisticsChart
                    title={combinedData.title}
                    data={combinedData.data}
                    maxValue={combinedData.maxValue}
                    unit="m"
                    labelColor="#7C3AED"
                    highlightedKeys={selectedMetrics}
                />
            </div>
        </div>
    );
}
