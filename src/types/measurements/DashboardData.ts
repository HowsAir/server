import { AirQualityReading, AirQuality } from './AirQuality';

export interface DashboardData {
    lastAirQualityReading: AirQualityReading;
    todayDistance: number;
    airQualityReadingsInfo: {
        airQualityReadings: AirQualityReading[];
        overallAirQuality: AirQuality | null;
    };
}
