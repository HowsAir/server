/**
 * @file airQuality.ts
 * @brief Utility functions for airQuality operations
 * @author Juan Diaz & Manuel Borregales
 */

import {
    AirGases,
    AirQuality,
    AirQualityReading,
    GasesPPMThresholds,
    GasesValues,
} from '../types/measurements/AirQuality';
import { Measurement } from '@prisma/client';

/**
 * Determines the air quality for a given gas and its measured value.
 *
 * AirGases -> getGasAirQuality(value: number) -> AirQuality
 *
 * @param gas - The type of gas (e.g., CO, NO2, O3).
 * @param value - The measured value for the gas in ppm.
 * @returns {AirQuality} - The air quality category (Good, Regular, Bad).
 */
const getGasAirQuality = (gas: AirGases, value: number): AirQuality => {
    const thresholds = GasesPPMThresholds[gas];
    if (value <= thresholds[AirQuality.Good]) {
        return AirQuality.Good;
    } else if (value <= thresholds[AirQuality.Regular]) {
        return AirQuality.Regular;
    } else {
        return AirQuality.Bad;
    }
};

/**
 * Calculates the proportional value of air quality based on thresholds.
 *
 * AirGases -> getGasProportionalValue(value: number) -> Number
 *
 * @param gas - The type of gas (e.g., CO, NO2, O3).
 * @param value - The measured value for the gas in ppm.
 * @returns {number} - A proportional value (0 to 100) indicating air quality severity.
 */
const getGasProportionalValue = (gas: AirGases, value: number): number => {
    const thresholds = GasesPPMThresholds[gas];
    const maxThreshold = thresholds[AirQuality.Bad]; // Max for Bad (e.g., 20 for CO)
    const regularThreshold = thresholds[AirQuality.Regular]; // Threshold for Regular (e.g., 12 for CO)
    const minThreshold = thresholds[AirQuality.Good]; // Threshold for Good (e.g., 9 for CO)

    // Case 1: Scaling from 0 to minThreshold -> proportionally from 0 to 20
    if (value < minThreshold) {
        return Math.floor((value / minThreshold) * 20);
    }

    // Case 2: Scaling from minThreshold to regularThreshold -> proportionally from 20 to 60
    if (value <= regularThreshold) {
        return (
            20 +
            Math.floor(
                ((value - minThreshold) / (regularThreshold - minThreshold)) *
                    40
            )
        );
    }

    // Case 3: Scaling from regularThreshold to maxThreshold -> proportionally from 60 to 100
    if (value <= maxThreshold) {
        return (
            60 +
            Math.floor(
                ((value - regularThreshold) /
                    (maxThreshold - regularThreshold)) *
                    40
            )
        );
    }

    // Beyond the worst threshold (e.g., CO > 20)
    return 100;
};

/**
 * Finds the gas with the worst air quality based on proportional values.
 *
 * Array<{ gas, proportionalValue, airQuality }> -> getWorstGas() -> { gas, proportionalValue, airQuality }
 *
 * @param gasesData - Array of gas data containing gas type, proportional value, and air quality.
 * @returns {Object} - The worst gas data (gas, proportionalValue, airQuality).
 */
const getWorstGasOnProportionalValue = (
    gasesData: Array<{
        gas: AirGases;
        proportionalValue: number;
        airQuality: AirQuality;
    }>
) => {
    return gasesData.reduce((worst, current) =>
        current.proportionalValue > worst.proportionalValue ? current : worst
    );
};

/**
 * Transforms raw gases values into an AirQualityReading.
 * We assume that the worst gas is the one with the highest proportional value, and we use its air quality.
 *
 * { GasesValues: gasesValues, Date: timestamp } -> getAirQualityReadingFromGasesValues() -> AirQualityReading
 *
 * @param gasesValues - The gases values to be transformed.
 * @param timestamp - The timestamp of the reading.
 * @returns {AirQualityReading} - An air quality reading with air quality, proportional values, and the worst gas.
 */
const getAirQualityReadingFromGasesValues = (
    gasesValues: GasesValues,
    timestamp: Date
): AirQualityReading => {
    const gasesData = [
        {
            gas: AirGases.O3,
            proportionalValue: getGasProportionalValue(
                AirGases.O3,
                gasesValues.o3
            ),
            airQuality: getGasAirQuality(AirGases.O3, gasesValues.o3),
        },
        {
            gas: AirGases.CO,
            proportionalValue: getGasProportionalValue(
                AirGases.CO,
                gasesValues.co
            ),
            airQuality: getGasAirQuality(AirGases.CO, gasesValues.co),
        },
        {
            gas: AirGases.NO2,
            proportionalValue: getGasProportionalValue(
                AirGases.NO2,
                gasesValues.no2
            ),
            airQuality: getGasAirQuality(AirGases.NO2, gasesValues.no2),
        },
    ];

    const worstGasData = getWorstGasOnProportionalValue(gasesData);

    return {
        timestamp: timestamp,
        worstGas: worstGasData.gas,
        airQuality: worstGasData.airQuality,
        proportionalValue: worstGasData.proportionalValue,
    };
};

/**
 * Calculates the average values for each gas from a set of measurements.
 *
 * Array<Measurement> -> calculateGasAverages() -> { o3, co, no2 }
 *
 * @param measurements - Array of measurement objects with gas values.
 * @returns {Object} - The average values for O3, CO, and NO2 gases.
 */
const calculateGasAverages = (measurements: Measurement[]): GasesValues => {
    const total = measurements.reduce(
        (acc, measurement) => {
            acc.o3 += measurement.o3Value;
            acc.co += measurement.coValue;
            acc.no2 += measurement.no2Value;
            return acc;
        },
        { o3: 0, co: 0, no2: 0 }
    );

    const count = measurements.length;

    return {
        o3: total.o3 / count,
        co: total.co / count,
        no2: total.no2 / count,
    };
};

/**
 * Splits a time range into chunks of the specified interval (e.g., 4 hours).
 * If the interval is greater than the total time range, it returns the whole range as one chunk.
 *
 * { start, end, intervalInHours } -> splitTimeRange() -> Array<{ start, end }>
 *
 * @param start - The start timestamp of the range.
 * @param end - The end timestamp of the range.
 * @param intervalInHours - The interval size in hours.
 * @returns {Array} - An array of time ranges with start and end times.
 */
const splitTimeRange = (
    start: Date,
    end: Date,
    intervalInHours: number
): Array<{ start: Date; end: Date }> => {
    const ranges: Array<{ start: Date; end: Date }> = [];

    // Align start time to the closest lower hour interval (e.g., 16:00, 18:00)
    const alignedStart = new Date(start);
    alignedStart.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0

    const timeDifferenceInHours =
        (end.getTime() - alignedStart.getTime()) / (1000 * 3600); // Convert ms to hours

    // If the time difference is less than the interval, return the whole range as one chunk
    if (timeDifferenceInHours <= intervalInHours) {
        ranges.push({ start: alignedStart, end });
        return ranges;
    }

    let currentStart = new Date(alignedStart);

    while (currentStart < end) {
        const currentEnd = new Date(currentStart);
        currentEnd.setHours(currentEnd.getHours() + intervalInHours);
        // Ensure the last range ends at the actual end timestamp
        if (currentEnd > end) {
            currentEnd.setTime(end.getTime()); // Adjust to end time if it exceeds
        }
        ranges.push({ start: currentStart, end: currentEnd });
        currentStart = new Date(currentEnd);
    }

    return ranges;
};

export const airQualityUtils = {
    getGasAirQuality,
    getGasProportionalValue,
    getWorstGasOnProportionalValue,
    getAirQualityReadingFromGasesValues,
    calculateGasAverages,
    splitTimeRange,
};
