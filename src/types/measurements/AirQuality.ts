export enum AirGases {
    CO = 'CO',
    NO2 = 'NO2',
    O3 = 'O3',
}

export enum AirQuality {
    Good = 'Good',
    Regular = 'Regular',
    Bad = 'Bad',
}

export const GasesPPMThresholds = {
    [AirGases.CO]: {
        [AirQuality.Good]: 9,
        [AirQuality.Regular]: 12,
        [AirQuality.Bad]: 20,
    },
    [AirGases.NO2]: {
        [AirQuality.Good]: 0.053,
        [AirQuality.Regular]: 0.1,
        [AirQuality.Bad]: 0.2,
    },
    [AirGases.O3]: {
        [AirQuality.Good]: 0.05,
        [AirQuality.Regular]: 0.1,
        [AirQuality.Bad]: 0.2,
    },
};

export interface GasesValues {
    o3: number;
    co: number;
    no2: number;
}

export interface AirQualityReading {
    timestamp: Date;
    airQuality: AirQuality | null;
    proportionalValue: number | null;
    worstGas: AirGases | null;
}
