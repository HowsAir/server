import { AirQualityReading } from './AirQuality';

export interface DashboardData {
    lastAirQualityReading: AirQualityReading;
    todayDistance: number;
    airQualityReadings: AirQualityReading[];
}
