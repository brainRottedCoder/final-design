// Station data types

export type StationColor = 'blue' | 'green' | 'orange' | 'yellow';

export interface DischargeStation {
    id: string;
    title: string;
    riverName: string;
    chartKey: string;
    discharge: string;
    velocity: string;
    waterLevel: string;
    color: StationColor;
}

export type WeatherStationColor = 'blue' | 'green' | 'orange';

export interface WeatherStation {
    id: string;
    title: string;
    chartKey: string;
    color: WeatherStationColor;
    windSpeed: string;
    windDirection: string;
    temperature: string;
    relativeHumidity: string;
    airPressure: string;
    solarRadiation: string;
    rainfallHR: string;
    rainfallDay: string;
    rainfallTotal: string;
}

export interface DischargeStationsData {
    sectionTitle: string;
    stations: DischargeStation[];
}

export interface WeatherStationsData {
    sectionTitle: string;
    stations: WeatherStation[];
}

export interface RainGaugeStation {
    id: string;
    title: string;
    chartKey: string;
    color: StationColor;
    rainfallHR: string;
    rainfallTotal: string;
}

export interface RainGaugeStationsData {
    sectionTitle: string;
    stations: RainGaugeStation[];
}

export interface DamStation {
    id: string;
    title: string;
    headLoss: string;
    intechLevel: string;
    levelPier1: string;
    levelPier6: string;
}

export interface DamStatisticsData {
    sectionTitle: string;
    charts: {
        headLoss: { title: string; data: { name: string; value: number }[]; maxValue: number };
        intechLevel: { title: string; data: { name: string; value: number }[]; maxValue: number };
        levelPier1: { title: string; data: { name: string; value: number }[]; maxValue: number };
        levelPier6: { title: string; data: { name: string; value: number }[]; maxValue: number };
        combined: {
            title: string;
            data: { name: string; value: number; color?: string }[];
            maxValue: number
        };
    };
}
