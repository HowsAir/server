/**
 * @file measurementService.ts
 * @brief Service to manage operations related to measurements
 * @autor Juan Diaz
 */

import { Measurement, NodeStatus } from '@prisma/client';
import prisma from '../libs/prisma';
import { DashboardData } from '../types/measurements/DashboardData';
import {
    AirQualityReading,
    AirQualityReadingsInfo,
    GeolocatedAirQualityReading,
    MeasurementGasesValues,
} from '../types/measurements/AirQuality';
import {
    MEASURING_FREQUENCY_SECONDS,
    MAX_PERMITTED_SPEED_MPS,
} from '../types/measurements/Distance';
import { airQualityUtils } from '../utils/airQualityUtils';
import cacheService from './cacheService';

/**
 * Saves a new measurement in the database
 *
 * @param o3Value The O3 value of the measurement.
 * @param latitude The latitude where the measurement was taken.
 * @param longitude The longitude where the measurement was taken.
 * @param userId The user ID associated with the measurement.
 * @returns {Promise<Measurement>} A promise that resolves to the saved Measurement object in the database.
 * @throws {Error} If there is an issue while saving the measurement.
 */

const createMeasurement = async (
    o3Value: number,
    latitude: number,
    longitude: number,
    userId: number
): Promise<Measurement> => {
    // Get the node ID based on the user ID
    const node = await prisma.node.findFirst({
        where: { userId, status: NodeStatus.ACTIVE }, // Use only active nodes
        select: { id: true },
    });

    if (!node) {
        throw new Error(`No active node found for user with ID ${userId}`);
    }

    const coValue = parseFloat((Math.random() * 15).toFixed(2)); // Random between 0 and 15 ppm
    const no2Value = parseFloat((Math.random() * 0.15).toFixed(3)); // Random between 0 and 0.15 ppm

    // Create the measurement data object
    const measurementData = {
        o3Value,
        latitude,
        longitude,
        nodeId: node.id,
        timestamp: new Date(),
        coValue,
        no2Value,
    };

    // Create the measurement entry in the database
    return await prisma.measurement.create({
        data: measurementData,
    });
};

/**
 * Calculates the distance between two geographical coordinates.
 *
 * Number: lat1, Number: lon1, Number: lat2, Number: lon2 -> getCoordinatesDistance() -> Number
 *
 * @param lat1 - Latitude of the first coordinate.
 * @param lon1 - Longitude of the first coordinate.
 * @param lat2 - Latitude of the second coordinate.
 * @param lon2 - Longitude of the second coordinate.
 * @returns {Number} - The distance in meters between the two coordinates.
 */
const getCoordinatesDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = (lat1 * Math.PI) / 180; // φ in radians
    const φ2 = (lat2 * Math.PI) / 180; // φ in radians
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Δφ in radians
    const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Δλ in radians

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
};

/**
 * Calculates the total distance for an array of measurements.
 * Ignoring the distance between 2 measurements when their distance is
 * greater than the one that can be traveled considering a certain maximum speed
 * and a certain measuring frequency.
 *
 * Array<Measurement>: measurements -> getMeasurementsTotalDistance() -> Number
 *
 * @param measurements - Array of measurement objects containing latitude and longitude.
 * @returns {Number} - The total distance in meters.
 */
const getMeasurementsTotalDistance = (measurements: Measurement[]): number => {
    if (measurements.length < 2) return 0;

    let totalDistance = 0;
    let coordinatesDistanceAux = 0;
    for (let i = 0; i < measurements.length - 1; i++) {
        coordinatesDistanceAux = measurementsService.getCoordinatesDistance(
            measurements[i].latitude,
            measurements[i].longitude,
            measurements[i + 1].latitude,
            measurements[i + 1].longitude
        );
        if (
            coordinatesDistanceAux >
            MAX_PERMITTED_SPEED_MPS * MEASURING_FREQUENCY_SECONDS
        ) {
            continue;
        }

        totalDistance += coordinatesDistanceAux;
    }

    return totalDistance;
};

/**
 * Calculates the total distance for today's measurements for a user.
 *
 * Number: userId -> getTodayTotalDistance() -> Promise<Number>
 *
 * @param userId - The ID of the user whose measurements are being retrieved.
 * @returns {Promise<Number>} - A promise that resolves with the total distance in meters.
 */
const getTodayTotalDistance = async (userId: number): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    const measurements = await getUserMeasurementsInRange(userId, {
        start: today,
        end: new Date(),
    });

    return getMeasurementsTotalDistance(measurements);
};

/**
 * Retrieves the last measurement a user's node has got.
 *
 * Number: userId -> getLastMeasurement() -> Promise<Measurement | null>
 *
 * @param userId - The ID of the user whose last measurement is to be retrieved.
 * @returns {Promise<Measurement | null>} - A promise that resolves to the last measurement or `null` if no measurements are found.
 */
const getLastMeasurement = async (
    userId: number
): Promise<Measurement | null> => {
    return await prisma.measurement.findFirst({
        where: {
            node: {
                userId: userId,
            },
        },
        orderBy: { timestamp: 'desc' },
    });
};

/**
 * Retrieves all measurements for within a specified time range.
 *
 *  { Date: start, Date: end }: timeRange -> getMeasurementsInRange() -> Promise<Array<Measurement>>
 *
 * @param timeRange - An object containing the start and end timestamps defining the time range.
 * @returns {Promise<Measurement[]>} - A promise that resolves to an array of measurements within the specified time range.
 */
const getMeasurementsInRange = async (
    timeRange: { start: Date; end: Date }
): Promise<Measurement[]> => {
    return await prisma.measurement.findMany({
        where: {
            timestamp: {
                gte: timeRange.start,
                lte: timeRange.end,
            },
        },
        orderBy: { timestamp: 'asc' },
    });
};

/**
 * Retrieves all measurements for a user within a specified time range.
 *
 * { Number: userId, { Date: start, Date: end }: timeRange } -> getUserMeasurementsInRange() -> Promise<Array<Measurement>>
 *
 * @param userId - The ID of the user whose measurements are to be retrieved.
 * @param timeRange - An object containing the start and end timestamps defining the time range.
 * @returns {Promise<Measurement[]>} - A promise that resolves to an array of measurements within the specified time range.
 */
const getUserMeasurementsInRange = async (
    userId: number,
    timeRange: { start: Date; end: Date }
): Promise<Measurement[]> => {
    return await prisma.measurement.findMany({
        where: {
            node: {
                userId: userId,
            },
            timestamp: {
                gte: timeRange.start,
                lte: timeRange.end,
            },
        },
        orderBy: { timestamp: 'asc' },
    });
};

/**
 * Retrieves air quality readings from a user for a given time range and interval size.
 *
 * Number:userId, Date: start, Date: end, Number: intervalInHours  -> getUserAirQualityReadingInRange() -> Promise<Array<AirQualityReading>>
 *
 * @param userId - The ID of the user to retrieve measurements for.
 * @param start - The start timestamp of the range.
 * @param end - The end timestamp of the range.
 * @param intervalInHours - The interval size in hours (e.g., 4 for 4-hour intervals).
 * @returns {Promise<AirQualityReading[]>} - An array of air quality readings for each interval.
 */
export const getUserAirQualityReadingsInRange = async (
    userId: number,
    start: Date,
    end: Date,
    intervalInHours: number
): Promise<AirQualityReading[]> => {
    const timeRanges = airQualityUtils.splitTimeRange(
        start,
        end,
        intervalInHours
    );
    const results: AirQualityReading[] = [];

    for (const range of timeRanges) {
        const measurements = await measurementsService.getUserMeasurementsInRange(
            userId,
            range
        );

        if (measurements.length === 0) {
            results.push({
                timestamp: range.start,
                gas: null,
                airQuality: null,
                proportionalValue: null,
                ppmValue: null,
            });
            continue;
        }

        //In case we need to get other measurements, like in a square or circle
        //we just just need to get the points of the user for the time range
        //define the rectangle corners, and get the measurements inside the
        //rectangle in the time range

        const gasesAverageValues =
            airQualityUtils.calculateGasAverages(measurements);

        const airQualityReading =
            airQualityUtils.getAirQualityReadingFromGasesValues(
                gasesAverageValues,
                range.start
            );

        results.push(airQualityReading);
    }

    return results;
};

/**
 * Retrieves the dashboard data for a given user, including air quality information and traveled distance.
 * We use caching to store the air quality readings info for 15 minutes.
 * 
 * { userId } -> getDashboardData() -> Promise<DashboardData | null>
 *
 * @param userId - The ID of the user whose dashboard data is to be retrieved.
 * @returns {Promise<DashboardData | null>} - A promise that resolves to the dashboard data object or `null` if no data is available for the user.
 */
const getDashboardData = async (
    userId: number
): Promise<DashboardData | null> => {
    const lastMeasurement =
        await measurementsService.getLastMeasurement(userId);

    if (!lastMeasurement) {
        return null;
    }

    const gasesValues: MeasurementGasesValues = {
        o3: lastMeasurement.o3Value,
        co: lastMeasurement.coValue,
        no2: lastMeasurement.no2Value,
    };

    const lastAirQualityReading =
        airQualityUtils.getAirQualityReadingFromGasesValues(
            gasesValues,
            lastMeasurement.timestamp
        );

    const todayTotalDistance =
        await measurementsService.getTodayTotalDistance(userId);

    const cacheKey = `airQualityReadingsInfo:userId:${userId}`;
    let airQualityReadingsInfo: AirQualityReadingsInfo | null;

    airQualityReadingsInfo = await cacheService.get<AirQualityReadingsInfo>(cacheKey);

    //If cache miss, get the data from the database
    //and store it in the cache
    //else, cache hit, use the data from the cache
    if (!airQualityReadingsInfo) {
        const hoursAgo = 24;
        const hoursInInterval = 2;
        const now = new Date();
        const start = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

        const airQualityReadings =
            await measurementsService.getUserAirQualityReadingsInRange(
                userId,
                start,
                now,
                hoursInInterval
            );

        const averageAirQuality =
            airQualityUtils.getAverageAirQualityFromAirQualityReadings(
                airQualityReadings
            );

        airQualityReadingsInfo = {
            airQualityReadings,
            overallAirQuality: averageAirQuality,
        };

        cacheService.set<AirQualityReadingsInfo>(cacheKey, airQualityReadingsInfo, 900);
    }

    const dashboardData: DashboardData = {
        lastAirQualityReading: lastAirQualityReading,
        todayDistance: todayTotalDistance,
        airQualityReadingsInfo,
    };

    return dashboardData;
};

/**
 * Retrieves geolocated air quality readings for a given time range.
 * 
 * { start: Date, end: Date } -> getGeolocatedAirQualityReadingsInRange() -> Promise<GeolocatedAirQualityReading[]>
 * 
 * @param timeRange - An object containing the start and end timestamps defining the time range.
 * @returns {Promise<GeolocatedAirQualityReading[]>} - A promise that resolves to an array of geolocated air quality readings within the specified time range.
 */
const getGeolocatedAirQualityReadingsInRange = async(
    timeRange: { start: Date; end: Date }
): Promise<GeolocatedAirQualityReading[]> => {
    const measurements = await measurementsService.getMeasurementsInRange(timeRange);

    const geolocatedAirQualityReadings: GeolocatedAirQualityReading[] = [];

    for (const measurement of measurements) {
        const measurementGasesValues: MeasurementGasesValues = {
            o3: measurement.o3Value,
            co: measurement.coValue,
            no2: measurement.no2Value,
        };

        const airQualityReading = airQualityUtils.getAirQualityReadingFromGasesValues(
            measurementGasesValues,
            measurement.timestamp
        );

        const geolocatedAirQualityReading: GeolocatedAirQualityReading = {
            ...airQualityReading,
            latitude: measurement.latitude,
            longitude: measurement.longitude,
        }

        geolocatedAirQualityReadings.push(geolocatedAirQualityReading);
    }

    return geolocatedAirQualityReadings;
}


export const measurementsService = {
    createMeasurement,
    getCoordinatesDistance,
    getMeasurementsTotalDistance,
    getTodayTotalDistance,
    getLastMeasurement,
    getMeasurementsInRange,
    getUserMeasurementsInRange,
    getUserAirQualityReadingsInRange,
    getDashboardData,
    getGeolocatedAirQualityReadingsInRange,
};
