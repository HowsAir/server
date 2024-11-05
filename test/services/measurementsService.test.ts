/**
 * @file measurementsService.test.ts
 * @brief Unit tests for the measurements service
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { measurementsService } from '../../src/services/measurementsService';
import prisma from '../../src/libs/prisma';
import { Measurement, Node } from '@prisma/client';

vi.mock('../../src/libs/prisma');

describe('measurementsService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('createMeasurement()', () => {
        it('should save a new measurement successfully', async () => {
            const userId = 1;
            const measurementData = {
                o3Value: 0.5,
                latitude: 40.7128,
                longitude: -74.006,
            };

            // Mock response for finding the user's node
            const mockNode: Pick<Node, 'id'> = { id: 1 };
            prisma.node.findFirst = vi.fn().mockResolvedValue(mockNode);

            // Mock response for measurement creation
            const mockMeasurement: Measurement = {
                id: 1,
                nodeId: mockNode.id,
                timestamp: new Date(),
                o3Value: measurementData.o3Value,
                coValue: 1.0,
                no2Value: 0.7,
                latitude: measurementData.latitude,
                longitude: measurementData.longitude,
            };
            prisma.measurement.create = vi
                .fn()
                .mockResolvedValue(mockMeasurement);

            const result = await measurementsService.createMeasurement(
                measurementData.o3Value,
                measurementData.latitude,
                measurementData.longitude,
                userId
            );

            expect(prisma.node.findFirst).toHaveBeenCalledWith({
                where: { userId, status: 'ACTIVE' },
                select: { id: true },
            });

            expect(prisma.measurement.create).toHaveBeenCalledWith({
                data: {
                    ...measurementData,
                    nodeId: mockNode.id,
                    timestamp: expect.any(Date),
                    coValue: expect.any(Number),
                    no2Value: expect.any(Number),
                },
            });

            expect(result).toEqual(mockMeasurement);
        });

        it('should throw an error if no active node is found for user', async () => {
            const userId = 1;
            const measurementData = {
                o3Value: 0.5,
                latitude: 40.7128,
                longitude: -74.006,
            };

            // Mock response for node lookup to return null
            prisma.node.findFirst = vi.fn().mockResolvedValue(null);

            await expect(
                measurementsService.createMeasurement(
                    measurementData.o3Value,
                    measurementData.latitude,
                    measurementData.longitude,
                    userId
                )
            ).rejects.toThrow();

            expect(prisma.node.findFirst).toHaveBeenCalledWith({
                where: { userId, status: 'ACTIVE' },
                select: { id: true },
            });
        });
    });

    describe('getMeasurements()', () => {
        it('should retrieve all measurements successfully', async () => {
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
                {
                    id: 2,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.2,
                    no2Value: 0.8,
                    latitude: 41.2033,
                    longitude: -77.1945,
                },
            ];

            prisma.measurement.findMany = vi
                .fn()
                .mockResolvedValue(mockMeasurements);

            const result = await measurementsService.getMeasurements();

            expect(prisma.measurement.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockMeasurements);
        });

        it('should throw an error if there is an issue retrieving measurements', async () => {
            prisma.measurement.findMany = vi
                .fn()
                .mockRejectedValue(
                    new Error('Failed to retrieve measurements')
                );

            await expect(
                measurementsService.getMeasurements()
            ).rejects.toThrow();

            expect(prisma.measurement.findMany).toHaveBeenCalled();
        });

        it('should return an empty list if there are no measurements', async () => {
            prisma.measurement.findMany = vi.fn().mockResolvedValue([]);

            const result = await measurementsService.getMeasurements();

            expect(prisma.measurement.findMany).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('getTodayMeasurements()', () => {
        it('should retrieve measurements for today successfully', async () => {
            const userId = 1;
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
                {
                    id: 2,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.2,
                    no2Value: 0.8,
                    latitude: 41.2033,
                    longitude: -77.1945,
                },
            ];

            prisma.measurement.findMany = vi
                .fn()
                .mockResolvedValue(mockMeasurements);

            const result =
                await measurementsService.getTodayMeasurements(userId);

            expect(prisma.measurement.findMany).toHaveBeenCalledWith({
                where: {
                    node: {
                        userId: userId,
                    },
                    timestamp: {
                        gte: expect.any(Date), // Check for start of the day
                    },
                },
                orderBy: { timestamp: 'asc' },
            });
            expect(result).toEqual(mockMeasurements);
        });

        it('should return an empty array if there are no measurements for today', async () => {
            const userId = 1;

            prisma.measurement.findMany = vi.fn().mockResolvedValue([]);

            const result =
                await measurementsService.getTodayMeasurements(userId);

            expect(prisma.measurement.findMany).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should throw an error if there is an issue retrieving measurements', async () => {
            const userId = 1;
            prisma.measurement.findMany = vi
                .fn()
                .mockRejectedValue(
                    new Error('Failed to retrieve measurements')
                );

            await expect(
                measurementsService.getTodayMeasurements(userId)
            ).rejects.toThrow();

            expect(prisma.measurement.findMany).toHaveBeenCalled();
        });
    });

describe('getCoordinatesDistance()', () => {
    it('should calculate distance between two coordinates correctly (New York to Philadelphia)', () => {
        const lat1 = 40.7128;
        const lon1 = -74.006;
        const lat2 = 39.9526;
        const lon2 = -75.1652;

        const distance = measurementsService.getCoordinatesDistance(
            lat1,
            lon1,
            lat2,
            lon2
        );

        expect(distance).toBeGreaterThanOrEqual(129400); // rango 129400 - 131400
        expect(distance).toBeLessThanOrEqual(131400);
    });

    it('should calculate distance between two coordinates correctly (Philadelphia to Washington D.C.)', () => {
        const lat1 = 39.9526;
        const lon1 = -75.1652;
        const lat2 = 38.9072;
        const lon2 = -77.0369;

        const distance = measurementsService.getCoordinatesDistance(
            lat1,
            lon1,
            lat2,
            lon2
        );

        // Aproximadamente 198,500 metros con margen de tolerancia
        expect(distance).toBeCloseTo(198500, -3); // Tolerancia de 1000 metros
    });

    it('should calculate the distance correctly for points on the equator', () => {
        const lat1 = 0;
        const lon1 = 0;
        const lat2 = 0;
        const lon2 = 1;

        const distance = measurementsService.getCoordinatesDistance(
            lat1,
            lon1,
            lat2,
            lon2
        );

        // Aproximadamente 111,320 metros con margen de tolerancia
        expect(distance).toBeCloseTo(111320, -3); // Tolerancia de 1000 metros
    });

    it('should return 0 distance if the coordinates are the same', () => {
        const lat = 40.7128;
        const lon = -74.006;

        const distance = measurementsService.getCoordinatesDistance(
            lat,
            lon,
            lat,
            lon
        );

        expect(distance).toBe(0);
    });

    it('should calculate a very small distance for nearby points (close by)', () => {
        const lat1 = 40.7128;
        const lon1 = -74.006;
        const lat2 = 40.7129;
        const lon2 = -74.0061;

        const distance = measurementsService.getCoordinatesDistance(
            lat1,
            lon1,
            lat2,
            lon2
        );
        console.log(distance);
        // Expected small distance, less than 100 meters
        expect(distance).toBeLessThan(14);
        expect(distance).toBeGreaterThan(13);
    });

    it('should calculate the distance correctly for points near the poles', () => {
        const lat1 = 89.9;
        const lon1 = 0;
        const lat2 = 89.9;
        const lon2 = 90;

        const distance = measurementsService.getCoordinatesDistance(
            lat1,
            lon1,
            lat2,
            lon2
        );

        // Small distance close to the poles, about 15,730 meters
        expect(distance).toBeCloseTo(15730, -1); // Tolerancia de 10 metros
    });
});


    // Tests for getMeasurementsTotalDistance
    describe('getMeasurementsTotalDistance()', () => {
        it('should calculate total distance for multiple measurements', () => {
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
                {
                    id: 2,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.2,
                    no2Value: 0.8,
                    latitude: 41.2033,
                    longitude: -77.1945,
                },
            ];

            const totalDistance =
                measurementsService.getMeasurementsTotalDistance(
                    mockMeasurements
                );
            expect(totalDistance).toBeGreaterThan(0); // Distance should be greater than 0 if coordinates are different
        });

        it('should return 0 if there are less than two measurements', () => {
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
            ];

            const totalDistance =
                measurementsService.getMeasurementsTotalDistance(
                    mockMeasurements
                );
            expect(totalDistance).toBe(0);
        });
    });
});

