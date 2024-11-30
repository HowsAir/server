/**
 * @file airQualityUtils.test.ts
 * @brief Unit tests for air quality utility functions
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { airQualityUtils } from '../../src/utils/airQualityUtils';
import {
    AirGases,
    AirQuality,
    GasesPPMThresholds,
    GasesValues,
    AirQualityReading,
} from '../../src/types/AirQuality';

describe('airQualityUtils', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getGasAirQuality()', () => {
        it('should return Good air quality when value is within the Good range', () => {
            const value = 0.04; // Example value within the Good range for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Good);
        });

        it('should return Regular air quality when value is within the Regular range', () => {
            const value = 0.08; // Example value within the Regular range for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Regular);
        });

        it('should return Bad air quality when value exceeds the Regular range', () => {
            const value = 0.2; // Example value above the Regular threshold for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Bad);
        });

        it('should return Good air quality for CO within its Good range', () => {
            const value = 8; // Example value within the Good range for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Good);
        });

        it('should return Regular air quality for CO within its Regular range', () => {
            const value = 10; // Example value within the Regular range for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Regular);
        });

        it('should return Bad air quality for CO above its Regular threshold', () => {
            const value = 13; // Example value above the Regular threshold for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getGasAirQuality(gas, value);
            expect(result).toBe(AirQuality.Bad);
        });
    });

describe('getGasProportionalValue()', () => {
    it('should return 0 for values at the absolute minimum', () => {
        const value = 0; // Minimum possible value
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBe(0); // Exact match for 0 (best quality)
    });

    it('should return a proportional value of around 20 for values at the Good threshold', () => {
        const value = 0.053; // Good threshold for O3
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(19); // Allow a 1 unit margin (i.e., 19, 20, or 21)
        expect(result).toBeLessThanOrEqual(22); // Allow a 1 unit margin
    });

    it('should return a proportional value around 10 for values halfway to the Good threshold', () => {
        const value = 0.0265; // Halfway to the Good threshold for O3 (0.053)
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(9); // Allow a 1 unit margin (i.e., 9, 10, or 11)
        expect(result).toBeLessThanOrEqual(11); // Allow a 1 unit margin
    });

    it('should return a proportional value between Good and Regular thresholds', () => {
        const value = 0.075; // Midway in Good → Regular range for O3
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(20); // Should be 20 or more
        expect(result).toBeLessThanOrEqual(60); // Should be less than or equal to 60 (allowing ±1 unit margin)
    });

    it('should return a proportional value around 60 for values at the Regular threshold', () => {
        const value = 0.1; // Regular threshold for O3
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(59); // Allow a 1 unit margin (i.e., 59, 60, or 61)
        expect(result).toBeLessThanOrEqual(61); // Allow a 1 unit margin
    });

    it('should return proportional values between Regular and Bad thresholds', () => {
        const value = 0.15; // Midway in Regular → Bad range for O3
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(60); // Should be 60 or more
        expect(result).toBeLessThan(100); // Should be less than 100 (i.e., not 100 or greater)
    });

    it('should return 100 for values at the Bad threshold', () => {
        const value = 0.2; // Bad threshold for O3
        const gas = AirGases.O3;

        const result = airQualityUtils.getGasProportionalValue(gas, value);
        expect(result).toBeGreaterThanOrEqual(99); // Allow a 1 unit margin (i.e., 99, 100, or 101)
        expect(result).toBeLessThanOrEqual(101); // Allow a 1 unit margin
    });
});






    describe('getWorstGasOnProportionalValue()', () => {
        it('should return the gas with the highest proportional value', () => {
            const gasesData = [
                {
                    gas: AirGases.O3,
                    proportionalValue: 10,
                    airQuality: AirQuality.Regular,
                },
                {
                    gas: AirGases.CO,
                    proportionalValue: 40,
                    airQuality: AirQuality.Bad,
                },
                {
                    gas: AirGases.NO2,
                    proportionalValue: 25,
                    airQuality: AirQuality.Good,
                },
            ];

            const result =
                airQualityUtils.getWorstGasOnProportionalValue(gasesData);
            expect(result.gas).toBe(AirGases.CO); // CO has the highest proportional value (40)
            expect(result.proportionalValue).toBe(40);
        });
    });

    describe('getAirQualityReadingFromGasesValues()', () => {
        it('should return an AirQualityReading with the worst gas', () => {
            const gasesValues: GasesValues = { o3: 0.12, co: 0.2, no2: 0.06 };
            const timestamp = new Date();

            const result = airQualityUtils.getAirQualityReadingFromGasesValues(
                gasesValues,
                timestamp
            );

            expect(result.timestamp).toBe(timestamp);
            expect(result.worstGas).toBe(AirGases.O3); // CO should be the worst gas due to highest proportional value
            expect(result.airQuality).toBe(AirQuality.Bad); // CO's quality is Bad
        });
    });

    describe('calculateGasAverages()', () => {
        it('should return correct average values for each gas', () => {
            const measurements = [
                {
                    id: 1,
                    latitude: 47,
                    longitude: 48,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.4,
                    coValue: 1.0,
                    no2Value: 0.7,
                },
                {
                    id: 1,
                    latitude: 47,
                    longitude: 48,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.2,
                    no2Value: 0.8,
                },
                {
                    id: 1,
                    latitude: 47,
                    longitude: 48,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.1,
                    no2Value: 0.9,
                },
            ];

            const result = airQualityUtils.calculateGasAverages(measurements);

            expect(result.o3).toBeCloseTo(0.5, 1);
            expect(result.co).toBeCloseTo(1.1, 1);
            expect(result.no2).toBeGreaterThan(0.79);
            expect(result.no2).toBeLessThan(0.81);
        });
    });

    describe('splitTimeRange()', () => {
        it('should split the time range into intervals of the specified size', () => {
            const start = new Date('2023-11-01T00:00:00Z');
            const end = new Date('2023-11-01T10:00:00Z');
            const intervalInHours = 2;

            const result = airQualityUtils.splitTimeRange(
                start,
                end,
                intervalInHours
            );

            expect(result.length).toBe(5); // Should create 5 intervals (2 hours each)
            expect(result[0].start).toEqual(start);
            expect(result[result.length - 1].end).toEqual(end);
        });

        it('should return a single range if the interval is larger than the time difference', () => {
            const start = new Date('2023-11-01T00:00:00Z');
            const end = new Date('2023-11-01T03:00:00Z');
            const intervalInHours = 5;

            const result = airQualityUtils.splitTimeRange(
                start,
                end,
                intervalInHours
            );

            expect(result.length).toBe(1); // Single range because interval is larger than the time difference
        });
    });
});