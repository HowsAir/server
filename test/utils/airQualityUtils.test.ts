/**
 * @file airQualityUtils.test.ts
 * @brief Unit tests for air quality utility functions
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { airQualityUtils } from '../../src/utils/airQualityUtils';
import {
    AirGases,
    AirQualities,
    GasesPPMThresholds,
    GasProportionalValueThresholds,
    MeasurementGasesValues,
    AirQualityReading,
} from '../../src/types/measurements/AirQuality';
import { time } from 'console';

describe('airQualityUtils', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getAirQualityFromGasPPMValue()', () => {
        it('should return Good air quality when value is within the Good range', () => {
            const value = 0.04; // Example value within the Good range for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Good);
        });

        it('should return Regular air quality when value is within the Regular range', () => {
            const value = 0.08; // Example value within the Regular range for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Regular);
        });

        it('should return Bad air quality when value exceeds the Regular range', () => {
            const value = 0.2; // Example value above the Regular threshold for O3
            const gas = AirGases.O3;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Bad);
        });

        it('should return Good air quality for CO within its Good range', () => {
            const value = 8; // Example value within the Good range for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Good);
        });

        it('should return Regular air quality for CO within its Regular range', () => {
            const value = 10; // Example value within the Regular range for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Regular);
        });

        it('should return Bad air quality for CO above its Regular threshold', () => {
            const value = 13; // Example value above the Regular threshold for CO
            const gas = AirGases.CO;

            const result = airQualityUtils.getAirQualityFromGasPPMValue(gas, value);
            expect(result).toBe(AirQualities.Bad);
        });
    });

    describe('getAirQualityFromGasProportionalValue()', () => {
        it('should return Good air quality when the proportional value is within the Good range', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Good] - 10;
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Good);
        });

        it('should return Regular air quality when the proportional value is within the Regular range', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Regular] - 10;
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Regular);
        });

        it('should return Bad air quality when the proportional value exceeds the Regular range', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Bad] - 10;
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Bad);
        });

        it('should return Good air quality for proportional value at the exact Good threshold', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Good];
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Good);
        });

        it('should return Regular air quality for proportional value at the exact Regular threshold', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Regular];
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Regular);
        });

        it('should return Bad air quality for proportional value at the exact Bad threshold', () => {
            const proportionalValue =
                GasProportionalValueThresholds[AirQualities.Bad];
            const result =
                airQualityUtils.getAirQualityFromGasProportionalValue(proportionalValue);
            expect(result).toBe(AirQualities.Bad);
        });
    });

    describe('getAverageAirQualityFromAirQualityReadings()', () => {
        it('should return the average air quality based on proportional values', () => {
            const readings: AirQualityReading[] = [
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Good,
                    proportionalValue: 15,
                    gas: null,
                    ppmValue: null,
                },
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Regular,
                    proportionalValue: 45,
                    gas: null,
                    ppmValue: null,
                },
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Bad,
                    proportionalValue: 80,
                    gas: null,
                    ppmValue: null,
                },
            ];

            const mockGetAirQualityFromGasProportionalValue = vi
                .spyOn(airQualityUtils, 'getAirQualityFromGasProportionalValue')
                .mockReturnValue(AirQualities.Regular);

            const result = airQualityUtils.getAverageAirQualityFromAirQualityReadings(readings);

            expect(
                mockGetAirQualityFromGasProportionalValue
            ).toHaveBeenCalledWith(46.666666666666664); // Average proportional value
            expect(result).toBe(AirQualities.Regular);

            mockGetAirQualityFromGasProportionalValue.mockRestore();
        });

        it('should return null if there are no valid readings', () => {
            const readings: AirQualityReading[] = [
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Good,
                    proportionalValue: null,
                    gas: null,
                    ppmValue: null,
                },
            ];


            const result = airQualityUtils.getAverageAirQualityFromAirQualityReadings(readings);
            expect(result).toBeNull();
        });

        it('should handle a mix of valid and invalid readings', () => {
            const readings: AirQualityReading[] = [
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Good,
                    proportionalValue: 20,
                    gas: null,
                    ppmValue: null,
                },
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Regular,
                    proportionalValue: null,
                    gas: null,
                    ppmValue: null,
                },
                {
                    timestamp: new Date(),
                    airQuality: AirQualities.Bad,
                    proportionalValue: 60,
                    gas: null,
                    ppmValue: null,
                },
            ];

            const mockGetAirQualityFromGasProportionalValue = vi
                .spyOn(airQualityUtils, 'getAirQualityFromGasProportionalValue')
                .mockReturnValue(AirQualities.Regular);

            const result = airQualityUtils.getAverageAirQualityFromAirQualityReadings(readings);

            expect(
                mockGetAirQualityFromGasProportionalValue
            ).toHaveBeenCalledWith(40); // Average of 20 and 60
            expect(result).toBe(AirQualities.Regular);

            mockGetAirQualityFromGasProportionalValue.mockRestore();
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

    describe('getWorstAirQualityReading()', () => {
        it('should return the gas with the highest proportional value', () => {
           const currentDate = new Date(); 
            
            const gasesData = [
                {
                    gas: AirGases.O3,
                    proportionalValue: 10,
                    airQuality: AirQualities.Regular,
                    ppmValue: 0.08,
                    timestamp : currentDate
                },
                {
                    gas: AirGases.CO,
                    proportionalValue: 40,
                    airQuality: AirQualities.Bad,
                    ppmValue: 13,
                    timestamp : currentDate
                },
                {
                    gas: AirGases.NO2,
                    proportionalValue: 25,
                    airQuality: AirQualities.Good,
                    ppmValue: 0.05,
                    timestamp : currentDate
                },
            ];

            const result =
                airQualityUtils.getWorstAirQualityReading(gasesData);
            expect(result.gas).toBe(AirGases.CO); // CO has the highest proportional value (40)
            expect(result.proportionalValue).toBe(40);
            expect(result).toEqual(
                {
                    gas: AirGases.CO,
                    proportionalValue: 40,
                    airQuality: AirQualities.Bad,
                    ppmValue: 13,
                    timestamp : currentDate 
                }
            )
        });
    });

    describe('getAirQualityReadingFromMeasurementGasesValues()', () => {
        it('should return an AirQualityReading with the worst gas', async () => {
            // Mock data
            const gasesValues: MeasurementGasesValues = { o3: 0.12, co: 0.2, no2: 0.06 };
            const timestamp = new Date();

            // Mocked return values for the utility functions
            const mockProportionalValues = {
                [AirGases.O3]: 60,
                [AirGases.CO]: 80,
                [AirGases.NO2]: 40,
            };
            const mockAirQualities = {
                [AirGases.O3]: AirQualities.Regular,
                [AirGases.CO]: AirQualities.Bad,
                [AirGases.NO2]: AirQualities.Good,
            };

            // Spies for mocking the internal functions as async
            const mockGetGasProportionalValue = vi
                .spyOn(airQualityUtils, 'getGasProportionalValue')
                .mockReturnValue(mockProportionalValues[AirGases.O3]);

            const mockGetGasAirQuality = vi
                .spyOn(airQualityUtils, 'getAirQualityFromGasPPMValue')
                .mockReturnValue(mockAirQualities[AirGases.O3]);

            const mockGetWorstGasOnProportionalValue = vi
                .spyOn(airQualityUtils, 'getWorstAirQualityReading')
                .mockReturnValueOnce({
                    gas: AirGases.CO,
                    proportionalValue: mockProportionalValues[AirGases.CO],
                    airQuality: mockAirQualities[AirGases.CO],
                    ppmValue: gasesValues.co,
                    timestamp : timestamp
                });

            // Execute the method
            const result = await airQualityUtils.getAirQualityReadingFromMeasurementGasesValues(
                gasesValues,
                timestamp
            );

            // Assertions
            expect(result.timestamp).toBe(timestamp);
            expect(result.gas).toBe(AirGases.CO); // CO should be the worst gas
            expect(result.airQuality).toBe(AirQualities.Bad); // CO's air quality is Bad
            expect(result.proportionalValue).toBe(
                mockProportionalValues[AirGases.CO]
            );
            expect(result.ppmValue).toBe(gasesValues.co);

            // Verify spy calls
            expect(mockGetGasProportionalValue).toHaveBeenCalledTimes(3);
            expect(mockGetGasAirQuality).toHaveBeenCalledTimes(3);
            expect(mockGetWorstGasOnProportionalValue).toHaveBeenCalledTimes(1);

            // Restore original implementations after test
            mockGetGasProportionalValue.mockRestore();
            mockGetGasAirQuality.mockRestore();
            mockGetWorstGasOnProportionalValue.mockRestore();
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