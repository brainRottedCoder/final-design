// Chart data types

export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface StatisticsChartData {
    title: string;
    data: ChartDataPoint[];
    maxValue: number;
}

export interface StatisticsData {
    sectionTitle: string;
    charts: {
        discharge: StatisticsChartData;
        velocity: StatisticsChartData;
        waterLevel: StatisticsChartData;
    };
}

export interface WeatherChartData {
    title: string;
    data: ChartDataPoint[];
    maxValue: number;
}

export interface WeatherStatisticsData {
    sectionTitle: string;
    charts: {
        windSpeed: WeatherChartData;
        windDirection: WeatherChartData;
        temperature: WeatherChartData;
        relativeHumidity: WeatherChartData;
        airPressure: WeatherChartData;
        solarRadiation: WeatherChartData;
        rainfallHR: WeatherChartData;
        rainfallDay: WeatherChartData;
        rainfallTotal: WeatherChartData;
    };
    maxValue: number;
}

export interface RainGaugeChartData {
    title: string;
    data: ChartDataPoint[];
    maxValue: number;
}

export interface RainGaugeStatisticsData {
    sectionTitle: string;
    charts: {
        rainfallHR: RainGaugeChartData;
        rainfallTotal: RainGaugeChartData;
    };
    maxValue: number;
}
