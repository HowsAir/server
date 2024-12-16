import { AirQualityReading, AirQualities, AirQualityReadingsInfo } from './AirQuality';

export interface DashboardData {
    lastAirQualityReading: AirQualityReading;
    todayDistance: number;
    airQualityReadingsInfo: AirQualityReadingsInfo;
}
