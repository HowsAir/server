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

    describe('getCalendarMetadata', () => {
        beforeEach(() => {
            vi.restoreAllMocks(); // Reset mocks before each test
        });

        it('should return calendar metadata with available dates when maps exist', async () => {
            const year = 2024;
            const month = 5;

            // Mock the response for Prisma queries
            const mockFirstMap = { timestamp: new Date('2020-01-01') };
            const mockMaps = [
                { timestamp: new Date('2024-05-15T18:00:00.000Z'), url: 'https://example.com/map1' },
                { timestamp: new Date('2024-05-15T18:30:00.000Z'), url: 'https://example.com/map2' },
                { timestamp: new Date('2024-05-16T12:00:00.000Z'), url: 'https://example.com/map3' },
            ];

            // Mocking the Prisma calls
            prisma.historicAirQualityMap.findFirst = vi.fn().mockResolvedValue(mockFirstMap);
            prisma.historicAirQualityMap.findMany = vi.fn().mockResolvedValue(mockMaps);

            const result = await historicAirQualityMapsService.getCalendarMetadata(year, month);

            expect(result).toEqual({
                firstAvailableYear: 2020,
                year: 2024,
                month: 5,
                availableDates: [
                    { date: new Date('2024-05-15'), times: ['18:00:00.000Z', '18:30:00.000Z'] },
                    { date: new Date('2024-05-16'), times: ['12:00:00.000Z'  ] },
                ],
            });
        });

        it('should return empty calendar metadata when no maps are found', async () => {
            const year = 2024;
            const month = 5;

            // Mock the response for Prisma queries
            const mockFirstMap = { timestamp: new Date('2020-01-01') };

            prisma.historicAirQualityMap.findFirst = vi.fn().mockResolvedValue(mockFirstMap);
            prisma.historicAirQualityMap.findMany = vi.fn().mockResolvedValue([]);

            const result = await historicAirQualityMapsService.getCalendarMetadata(year, month);

            expect(result).toEqual({
                firstAvailableYear: 2020,
                year: 2024,
                month: 5,
                availableDates: [],
            });
        });

        it('should return null for firstAvailableYear when no maps are found in the database', async () => {
            const year = 2024;
            const month = 5;

            // Mock the response for Prisma queries
            prisma.historicAirQualityMap.findFirst = vi.fn().mockResolvedValue(null);
            prisma.historicAirQualityMap.findMany = vi.fn().mockResolvedValue([]);

            const result = await  historicAirQualityMapsService.getCalendarMetadata(year, month);

            expect(result).toEqual({
                firstAvailableYear: null,
                year: 2024,
                month: 5,
                availableDates: [],
            });
        });
    });

    describe('getHistoricAirQualityMap()', () => {
        it('should return the historic air quality map for a valid timestamp', async () => {
            const mockMap = { id: 1, url: 'https://cloudinary.com/some-map-url', timestamp };

            // Mock Prisma query to return the map
            prisma.historicAirQualityMap.findFirst = vi.fn().mockResolvedValue(mockMap);

            const result = await historicAirQualityMapsService.getHistoricAirQualityMap(timestamp);

            expect(result).toEqual(mockMap);
        });

        it('should return null if no map is found for the given timestamp', async () => {
            // Mock Prisma query to return null (no map found)
            prisma.historicAirQualityMap.findFirst = vi.fn().mockResolvedValue(null);

            const result = await historicAirQualityMapsService.getHistoricAirQualityMap(timestamp);

            expect(result).toBeNull();
        });

        it('should handle errors gracefully when fetching the map', async () => {
            // Simulating an error (e.g., database down)
            prisma.historicAirQualityMap.findFirst = vi.fn().mockRejectedValue(new Error('Database error'));

            await expect(
                historicAirQualityMapsService.getHistoricAirQualityMap(timestamp)
            ).rejects.toThrow('Database error');
        });
    });
});