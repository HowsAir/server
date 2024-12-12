/**
 * @file historicAirQualityMapsService.test.ts
 * @brief Unit tests for the historic air quality maps service
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historicAirQualityMapsService } from '../../src/services/historicAirQualityMapsService';
import prisma from '../../src/libs/prisma';

vi.mock('../../src/libs/prisma'); // Mocking Prisma client

describe('historicAirQualityMapsService', () => {
    const url = 'https://cloudinary.com/some-map-url';
    const timestamp = new Date('2024-12-06T12:00:00Z');

    beforeEach(() => {
        // Reset any mocks or spies before each test
        vi.clearAllMocks();
    });

    describe('saveHistoricAirQualityMap()', () => {
        it('should save a historic air quality map successfully', async () => {
            // Mock the Prisma create method
            prisma.historicAirQualityMap.create = vi.fn().mockResolvedValue({
                id: 1,
                url,
                timestamp,
            });

            // Call the service method
            const result =
                await historicAirQualityMapsService.saveHistoricAirQualityMap(
                    url,
                    timestamp
                );

            // Assertions
            expect(result).toEqual({ id: 1, url, timestamp });
            expect(prisma.historicAirQualityMap.create).toHaveBeenCalledWith({
                data: {
                    url,
                    timestamp,
                },
            });
        });

        it('should throw an error if the URL or timestamp already exists', async () => {
            // Simulating the case where the URL or timestamp already exists
            prisma.historicAirQualityMap.create = vi
                .fn()
                .mockRejectedValue(
                    new Error(
                        'Unique constraint failed on the fields: (`url`, `timestamp`)'
                    )
                );

            // Call the service and assert that it throws an error
            await expect(
                historicAirQualityMapsService.saveHistoricAirQualityMap(
                    url,
                    timestamp
                )
            ).rejects.toThrow(
                'Unique constraint failed on the fields: (`url`, `timestamp`)'
            );
        });

        it('should handle general errors gracefully', async () => {
            // Simulating a general error during the save operation
            prisma.historicAirQualityMap.create = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                historicAirQualityMapsService.saveHistoricAirQualityMap(
                    url,
                    timestamp
                )
            ).rejects.toThrow('Database error');
        });
    });

    describe('getHistoricAirQualityMaps()', () => {
        it('should retrieve all historic air quality maps', async () => {
            // Mocking the findMany method to return mock data
            const mockData = [
                {
                    id: 1,
                    url: 'https://cloudinary.com/map1',
                    timestamp: new Date('2024-12-06T12:00:00Z'),
                },
                {
                    id: 2,
                    url: 'https://cloudinary.com/map2',
                    timestamp: new Date('2024-12-06T12:30:00Z'),
                },
            ];
            prisma.historicAirQualityMap.findMany = vi
                .fn()
                .mockResolvedValue(mockData);

            // Call the service method
            const result =
                await historicAirQualityMapsService.getHistoricAirQualityMaps();

            // Assertions
            expect(result).toEqual(mockData);
            expect(prisma.historicAirQualityMap.findMany).toHaveBeenCalledWith({
                orderBy: {
                    timestamp: 'desc',
                },
            });
        });

        it('should handle errors gracefully when fetching maps', async () => {
            // Simulating an error during the fetch operation
            prisma.historicAirQualityMap.findMany = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                historicAirQualityMapsService.getHistoricAirQualityMaps()
            ).rejects.toThrow('Database error');
        });
    });

    describe('getLastHistoricAirQualityMap()', () => {
        it('should retrieve the most recent historic air quality map', async () => {
            // Mocking the findFirst method to return a mock map
            const mockMap = {
                id: 1,
                url: 'https://cloudinary.com/map1',
                timestamp: new Date('2024-12-06T12:00:00Z'),
            };
            prisma.historicAirQualityMap.findFirst = vi
                .fn()
                .mockResolvedValue(mockMap);

            // Call the service method
            const result =
                await historicAirQualityMapsService.getLastHistoricAirQualityMap();

            // Assertions
            expect(result).toEqual(mockMap);
            expect(prisma.historicAirQualityMap.findFirst).toHaveBeenCalledWith({
                orderBy: {
                    timestamp: 'desc',
                },
            });
        });

        it('should handle errors gracefully when fetching the map', async () => {
            // Simulating an error during the fetch operation
            prisma.historicAirQualityMap.findFirst = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                historicAirQualityMapsService.getLastHistoricAirQualityMap()
            ).rejects.toThrow('Database error');
        });
    });
});
