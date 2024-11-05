/**
 * @file measurementService.ts
 * @brief Service to manage operations related to measurements
 * @autor Juan Diaz
 */

import { Measurement, NodeStatus } from '@prisma/client';
import prisma from '../libs/prisma';

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

    // Generate random values for coValue and no2Value
    const coValue = parseFloat((Math.random() * 1.5 + 0.3).toFixed(2)); // Example: random between 0.3 and 1.8
    const no2Value = parseFloat((Math.random() * 1.2 + 0.1).toFixed(2)); // Example: random between 0.1 and 1.3

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
 * Retrieves all measurements stored in the database
 *
 * @returns {Promise<Measurement[]>} A promise that resolves with an array of Measurement objects containing all stored measurements.
 * @throws {Error} If there is an issue while retrieving measurements.
 */

const getMeasurements = async (): Promise<Measurement[]> => {
    return await prisma.measurement.findMany();
};

/**
 * Retrieves all measurements for today for a specific user.
 *
 * Number: userId -> getTodayMeasurements() -> Promise<Array<Measurement>>
 *
 * @param userId - The ID of the user whose measurements are being retrieved.
 * @returns {Promise<Array<Measurement>>} - A promise that resolves with an array of measurements.
 */
const getTodayMeasurements = async (userId: number): Promise<Measurement[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    const measurements = await prisma.measurement.findMany({
        where: {
            node: {
                userId: userId,
            },
            timestamp: {
                gte: today,
            },
        },
        orderBy: { timestamp: 'asc' }
    });

    return measurements;
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

    return R * c; // Distance in meters
};

/**
 * Calculates the total distance for an array of measurements.
 *
 * Array<Measurement>: measurements -> getMeasurementsTotalDistance() -> Number
 *
 * @param measurements - Array of measurement objects containing latitude and longitude.
 * @returns {Number} - The total distance in meters.
 */
const getMeasurementsTotalDistance = (measurements: Measurement[]): number => {
    if (measurements.length < 2) return 0;

    let totalDistance = 0;

    for (let i = 0; i < measurements.length - 1; i++) {
        totalDistance += getCoordinatesDistance(
            measurements[i].latitude,
            measurements[i].longitude,
            measurements[i + 1].latitude,
            measurements[i + 1].longitude
        );
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
const getTodayTotalDistance = async (
    userId: number
): Promise<number> => {
    const measurements =
        await getTodayMeasurements(userId);

    return getMeasurementsTotalDistance(measurements);
};

export const measurementsService = {
    createMeasurement,
    getMeasurements,
    getTodayMeasurements,
    getCoordinatesDistance,
    getMeasurementsTotalDistance,
    getTodayTotalDistance,
};
