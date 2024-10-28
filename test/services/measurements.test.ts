/**
 * @file measurementsService.test.ts
 * @brief Unit tests for the measurements service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { measurementsService } from '../../src/services/measurementsService';
import prisma from '../../src/libs/prisma';
import { Measurement, Node } from '@prisma/client';

vi.mock('../../src/libs/prisma');

describe('measurementsService', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Reset all mocks before each test
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
});
