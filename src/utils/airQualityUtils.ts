/**
 * @file airQuality.ts
 * @brief Utility functions for airQuality operations
 * @author Juan Diaz & Manuel Borregales
 */

import { get } from 'http';
import {
    AirGases,
    AirQuality,
    AirQualityReading,
    GasesPPMThresholds,
    GasesValues,
    GasProportionalValueThresholds,
} from '../types/measurements/AirQuality';
import { Measurement } from '@prisma/client';

/**
 * Determines the air quality for a given gas and its measured ppm value.
 *
 * AirGases: gas, Number: value -> getGasAirQualityFromPPMValue() -> AirQuality
 *
 * @param gas - The type of gas (e.g., CO, NO2, O3).
 * @param value - The measured value for the gas in ppm.
 * @returns {AirQuality} - The air quality category (Good, Regular, Bad).
 */
const getAirQualityFromGasPPMValue = (gas: AirGases, value: number): AirQuality => {
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
 * Determines the air quality for a gas proportional value.
 *
 * Number: proportionalValue -> getGasAirQualityFromProportionalValue() -> AirQuality
 *
 * @param proportionalValue - The gas proportional value
 * @returns {AirQuality} - The air quality category (Good, Regular, Bad).
 */
const getAirQualityFromGasProportionalValue = (proportionalValue: number): AirQuality => {
    if (proportionalValue <= GasProportionalValueThresholds[AirQuality.Good]) {
        return AirQuality.Good;
    } else if (proportionalValue <= GasProportionalValueThresholds[AirQuality.Regular]) {
        return AirQuality.Regular;
    } else {
        return AirQuality.Bad;
    }
};

/**
 * Calculates the average air quality from a set of air quality readings.
 * 
 * Array<AirQualityReading> -> getAverageAirQualityFromAirQualityReadings() -> AirQuality | null
 * 
 * @param readings - Array of air quality readings.
 * @returns {AirQuality | null} - The average air quality or null if no valid readings. 
 */
const getAverageAirQualityFromAirQualityReadings = (readings: AirQualityReading[]): AirQuality | null => {
    let countOfValidReadings = 0;
    let sumOfProportionalValues = 0;

    for (const reading of readings) {
        if (reading.proportionalValue != null) {
            countOfValidReadings++;
            sumOfProportionalValues += reading.proportionalValue;
        }
    }

    const averageProportionalValue =
        countOfValidReadings > 0
            ? sumOfProportionalValues / countOfValidReadings
            : null;

    const overallAirQuality = averageProportionalValue != null
        ? airQualityUtils.getAirQualityFromGasProportionalValue(averageProportionalValue)
        : null;

    return overallAirQuality;
}

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
    const gasPPMThresholds = GasesPPMThresholds[gas];
    const maxPPMThreshold = gasPPMThresholds[AirQuality.Bad]; // Max for Bad (e.g., 20 for CO)
    const regularPPMThreshold = gasPPMThresholds[AirQuality.Regular]; // Threshold for Regular (e.g., 12 for CO)
    const minPPMThreshold = gasPPMThresholds[AirQuality.Good]; // Threshold for Good (e.g., 9 for CO)
    
    const gasProportionalValueThresholds = GasProportionalValueThresholds;
    const maxProportionalValueThreshold = gasProportionalValueThresholds[AirQuality.Bad];
    const regularProportionalValueThreshold = gasProportionalValueThresholds[AirQuality.Regular];
    const minProportionalValueThreshold = gasProportionalValueThresholds[AirQuality.Good];

    if (value <= minPPMThreshold) {
        return Math.floor((value / minPPMThreshold) * minProportionalValueThreshold);
    }

    if (value <= regularPPMThreshold) {
        return (
            minProportionalValueThreshold +
            Math.floor(
                ((value - minPPMThreshold) / (regularPPMThreshold - minPPMThreshold)) *
                    (regularProportionalValueThreshold - minProportionalValueThreshold)
            )
        );
    }

    if (value <= maxPPMThreshold) {
        return (
            regularProportionalValueThreshold +
            Math.floor(
                ((value - regularPPMThreshold) /
                    (maxPPMThreshold - regularPPMThreshold)) *
                    (maxProportionalValueThreshold - regularProportionalValueThreshold)
            )
        );
    }

    // Beyond the worst threshold
    return maxProportionalValueThreshold;
};

/**
 * Finds the gas with the worst air quality based on proportional values.
 *
 * Array<{ gas, proportionalValue, airQuality, ppmValue }> -> getWorstGas() -> { gas, proportionalValue, airQuality, ppmValue }
 *
 * @param gasesData - Array of gas data containing gas type, proportional value, and air quality.
 * @returns {Object} - The worst gas data (gas, proportionalValue, airQuality, ppmValue).
 */
const getWorstGasOnProportionalValue = (
    gasesData: Array<{
        gas: AirGases;
        proportionalValue: number;
        airQuality: AirQuality;
        ppmValue: number;
    }>
): {
    gas: AirGases;
    proportionalValue: number;
    airQuality: AirQuality;
    ppmValue: number;
} => {
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
            proportionalValue: airQualityUtils.getGasProportionalValue(
                AirGases.O3,
                gasesValues.o3
            ),
            airQuality: airQualityUtils.getAirQualityFromGasPPMValue(
                AirGases.O3,
                gasesValues.o3
            ),
            ppmValue: gasesValues.o3,
        },
        {
            gas: AirGases.CO,
            proportionalValue: airQualityUtils.getGasProportionalValue(
                AirGases.CO,
                gasesValues.co
            ),
            airQuality: airQualityUtils.getAirQualityFromGasPPMValue(
                AirGases.CO,
                gasesValues.co
            ),
            ppmValue: gasesValues.co,
        },
        {
            gas: AirGases.NO2,
            proportionalValue: airQualityUtils.getGasProportionalValue(
                AirGases.NO2,
                gasesValues.no2
            ),
            airQuality: airQualityUtils.getAirQualityFromGasPPMValue(
                AirGases.NO2,
                gasesValues.no2
            ),
            ppmValue: gasesValues.no2,
        },
    ];

    const worstGasData =
        airQualityUtils.getWorstGasOnProportionalValue(gasesData);

    return {
        timestamp: timestamp,
        worstGas: worstGasData.gas,
        airQuality: worstGasData.airQuality,
        proportionalValue: worstGasData.proportionalValue,
        ppmValue: worstGasData.ppmValue,
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
    getAirQualityFromGasPPMValue,
    getAirQualityFromGasProportionalValue,
    getAverageAirQualityFromAirQualityReadings,
    getGasProportionalValue,
    getWorstGasOnProportionalValue,
    getAirQualityReadingFromGasesValues,
    calculateGasAverages,
    splitTimeRange,
};
