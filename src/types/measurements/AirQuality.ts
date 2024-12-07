export enum AirGases {
    CO = 'CO',
    NO2 = 'NO2',
    O3 = 'O3',
}

export enum AirQualities {
    Good = 'Good',
    Regular = 'Regular',
    Bad = 'Bad',
}

export const GasesPPMThresholds = {
    [AirGases.CO]: {
        [AirQualities.Good]: 9,
        [AirQualities.Regular]: 12,
        [AirQualities.Bad]: 20,
    },
    [AirGases.NO2]: {
        [AirQualities.Good]: 0.053,
        [AirQualities.Regular]: 0.1,
        [AirQualities.Bad]: 0.2,
    },
    [AirGases.O3]: {
        [AirQualities.Good]: 0.05,
        [AirQualities.Regular]: 0.1,
        [AirQualities.Bad]: 0.2,
    },
};

export const GasProportionalValueThresholds = {
    [AirQualities.Good]: 20,
    [AirQualities.Regular]: 60,
    [AirQualities.Bad]: 100,
};

export interface MeasurementGasesValues {
    o3: number;
    co: number;
    no2: number;
}

/**
 *
 * This corresponds to a reading of air quality data at a specific time.
 * The gas field is the worst gas in the reading, which is used to determine the air quality.
 *
 */
export interface AirQualityReading {
    timestamp: Date;
    airQuality: AirQualities | null;
    proportionalValue: number | null;
    gas: AirGases | null; //
    ppmValue: number | null;
}

/**
 *
 * This corresponds to a reading of air quality data at a specific time and location.
 * It extends the AirQualityReading interface to include the latitude and longitude of the location.
 * 
 */
export interface GeolocatedAirQualityReading extends AirQualityReading {
    latitude: number;
    longitude: number;
}

/**
 * 
 * This corresponds to a set of air quality readings 
 * and the overall air quality for the set of readings.
 * 
 */
export interface AirQualityReadingsInfo {
    airQualityReadings: AirQualityReading[];
    overallAirQuality: AirQualities | null;
}