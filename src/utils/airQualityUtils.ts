/**
 * @file airQualityUtils.ts
 * @brief Utility functions for airQuality operations
 * @author Juan Diaz
 */

import {
    AirGases,
    AirQualities,
    AirQualityReading,
    GasesPPMThresholds,
    MeasurementGasesValues,
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
 * @returns {AirQualities} - The air quality category (Good, Regular, Bad).
 */
const getAirQualityFromGasPPMValue = (
    gas: AirGases,
    value: number
): AirQualities => {
    const thresholds = GasesPPMThresholds[gas];
    if (value <= thresholds[AirQualities.Good]) {
        return AirQualities.Good;
    } else if (value <= thresholds[AirQualities.Regular]) {
        return AirQualities.Regular;
    } else {
        return AirQualities.Bad;
    }
};

/**
 * Determines the air quality for a gas proportional value.
 *
 * Number: proportionalValue -> getGasAirQualityFromProportionalValue() -> AirQuality
 *
 * @param proportionalValue - The gas proportional value
 * @returns {AirQualities} - The air quality category (Good, Regular, Bad).
 */
const getAirQualityFromGasProportionalValue = (
    proportionalValue: number
): AirQualities => {
    if (
        proportionalValue <= GasProportionalValueThresholds[AirQualities.Good]
    ) {
        return AirQualities.Good;
    } else if (
        proportionalValue <=
        GasProportionalValueThresholds[AirQualities.Regular]
    ) {
        return AirQualities.Regular;
    } else {
        return AirQualities.Bad;
    }
};

/**
 * Calculates the average air quality from a set of air quality readings.
 *
 * Array<AirQualityReading> -> getAverageAirQualityFromAirQualityReadings() -> AirQuality | null
 *
 * @param readings - Array of air quality readings.
 * @returns {AirQualities | null} - The average air quality or null if no valid readings.
 */
const getAverageAirQualityFromAirQualityReadings = (
    readings: AirQualityReading[]
): AirQualities | null => {
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

    const overallAirQuality =
        averageProportionalValue != null
            ? airQualityUtils.getAirQualityFromGasProportionalValue(
                  averageProportionalValue
              )
            : null;

    return overallAirQuality;
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
    const gasPPMThresholds = GasesPPMThresholds[gas];
    const maxPPMThreshold = gasPPMThresholds[AirQualities.Bad]; // Max for Bad (e.g., 20 for CO)
    const regularPPMThreshold = gasPPMThresholds[AirQualities.Regular]; // Threshold for Regular (e.g., 12 for CO)
    const minPPMThreshold = gasPPMThresholds[AirQualities.Good]; // Threshold for Good (e.g., 9 for CO)

    const gasProportionalValueThresholds = GasProportionalValueThresholds;
    const maxProportionalValueThreshold =
        gasProportionalValueThresholds[AirQualities.Bad];
    const regularProportionalValueThreshold =
        gasProportionalValueThresholds[AirQualities.Regular];
    const minProportionalValueThreshold =
        gasProportionalValueThresholds[AirQualities.Good];

    if (value <= minPPMThreshold) {
        return Math.floor(
            (value / minPPMThreshold) * minProportionalValueThreshold
        );
    }

    if (value <= regularPPMThreshold) {
        return (
            minProportionalValueThreshold +
            Math.floor(
                ((value - minPPMThreshold) /
                    (regularPPMThreshold - minPPMThreshold)) *
                    (regularProportionalValueThreshold -
                        minProportionalValueThreshold)
            )
        );
    }

    if (value <= maxPPMThreshold) {
        return (
            regularProportionalValueThreshold +
            Math.floor(
                ((value - regularPPMThreshold) /
                    (maxPPMThreshold - regularPPMThreshold)) *
                    (maxProportionalValueThreshold -
                        regularProportionalValueThreshold)
            )
        );
    }

    // Beyond the worst threshold
    return maxProportionalValueThreshold;
};

/**
 * Finds the gas with the worst air quality based on proportional values.
 *
 * Array<AirQualityReading> -> getWorstAirQualityReading() -> AirQualityReading
 *
 * @param airQualityReadings - Array of air quality readings. 
 * @returns {Object} - The worst air quality reading. 
 */
const getWorstAirQualityReading = (
    airQualityReadings: AirQualityReading[]
): AirQualityReading => {
    return airQualityReadings.reduce((worst, current) =>
        current.proportionalValue! > worst.proportionalValue! ? current : worst
    );
};

/**
 * Helper function to create an air quality reading for a single gas.
 *
 * @param gas - The type of gas being evaluated.
 * @param ppmValue - The gas concentration in parts per million (PPM).
 * @param timestamp - The timestamp of the reading.
 * @returns {AirQualityReading} - Partial air quality reading for the given gas.
 */
const getAirQualityReadingFromMeasurementSingleGasValue = (
    gas: AirGases,
    ppmValue: number,
    timestamp: Date
): AirQualityReading => ({
    gas,
    proportionalValue: airQualityUtils.getGasProportionalValue(gas, ppmValue),
    airQuality: airQualityUtils.getAirQualityFromGasPPMValue(gas, ppmValue),
    ppmValue,
    timestamp,
});

/**
 * Transforms raw gases values into an AirQualityReading.
 * We assume that the worst gas is the one with the highest proportional value, and we use its air quality.
 *
 * { MeasurementGasesValues: measurementGasesValues, Date: timestamp } -> 
 * 
 *                                              getAirQualityReadingFromMeasurementGasesValues() 
*                         AirQualityReading  <- 
 *
 * @param measurementGasesValues - The gases values to be transformed.
 * @param timestamp - The timestamp of the reading.
 * @returns {AirQualityReading} - An air quality reading with air quality, proportional values, and the worst gas.
 */
const getAirQualityReadingFromMeasurementGasesValues = (
    measurementGasesValues: MeasurementGasesValues,
    timestamp: Date
): AirQualityReading => {
    const gasesAirQualityReadings = [
        getAirQualityReadingFromMeasurementSingleGasValue(
            AirGases.O3,
            measurementGasesValues.o3,
            timestamp
        ),
        getAirQualityReadingFromMeasurementSingleGasValue(
            AirGases.CO,
            measurementGasesValues.co,
            timestamp
        ),
        getAirQualityReadingFromMeasurementSingleGasValue(
            AirGases.NO2,
            measurementGasesValues.no2,
            timestamp
        ),
    ];

    const worstAirQualityReading =
        airQualityUtils.getWorstAirQualityReading(gasesAirQualityReadings);

    return worstAirQualityReading;
};

/**
 * Calculates the average values for each gas from a set of measurements.
 *
 * Array<Measurement> -> calculateGasAverages() -> { o3, co, no2 }
 *
 * @param measurements - Array of measurement objects with gas values.
 * @returns {Object} - The average values for O3, CO, and NO2 gases.
 */
const calculateGasAverages = ( measurements: Measurement[]
): MeasurementGasesValues => {
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
    getWorstAirQualityReading,
    getAirQualityReadingFromMeasurementSingleGasValue,
    getAirQualityReadingFromMeasurementGasesValues,
    calculateGasAverages,
    splitTimeRange,
};
