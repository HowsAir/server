import { AirQualityReading, AirQualities } from './AirQuality';

export interface DashboardData {
    lastAirQualityReading: AirQualityReading;
    todayDistance: number;
    airQualityReadingsInfo: {
        airQualityReadings: AirQualityReading[];
        overallAirQuality: AirQualities | null;
    };
}
