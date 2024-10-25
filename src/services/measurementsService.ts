/**
 * @file measurementService.ts
 * @brief Service to manage operations related to measurements
 * @autor
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

export const measurementsService = {
    createMeasurement,
    getMeasurements,
};
