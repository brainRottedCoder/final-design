// Dashboard data types

export interface MetricCardData {
    id: string;
    title: string;
    value: string;
    clickable?: boolean;
}

export interface LastUpdatedInfo {
    date: string;
    time: string;
}

export interface DashboardData {
    metrics: MetricCardData[];
    lastUpdated: LastUpdatedInfo;
}
