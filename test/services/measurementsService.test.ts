/**
 * @file measurementsService.test.ts
 * @brief Unit tests for the measurements service
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { measurementsService } from '../../src/services/measurementsService';
import {
    airQualityUtils,
} from '../../src/utils/airQualityUtils';
import prisma from '../../src/libs/prisma';
import { Measurement, Node } from '@prisma/client';
import { AirGases, AirQualities } from '../../src/types/measurements/AirQuality';
import { MAX_PERMITTED_SPEED_MPS, MEASURING_FREQUENCY_SECONDS } from '../../src/types/measurements/Distance';
vi.mock('../../src/libs/prisma');
vi.mock('../../src/utils/airQualityUtils');

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

            // Expected small distance, less than 100 meters
            expect(distance).toBeLessThanOrEqual(14);
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
            expect(distance).toBeCloseTo(15730, -1.5); // Tolerancia de 10 metros
        });
    });

    describe('getMeasurementsTotalDistance()', () => {
        it('should calculate total distance for two measurements that are close enough', () => {
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.71253,
                    longitude: -77.196,
                },
                {
                    id: 2,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.2,
                    no2Value: 0.8,
                    latitude: 40.71252,
                    longitude: -77.1965,
                },
            ];

            const mockDistance = 15; // Mock a valid distance within the permissible range

            const mockGetCoordinatesDistance = vi
                .spyOn(measurementsService, 'getCoordinatesDistance')
                .mockReturnValue(mockDistance);

            const totalDistance = measurementsService.getMeasurementsTotalDistance(mockMeasurements);

            expect(totalDistance).toBe(mockDistance); // Expect the mocked distance
            expect(mockGetCoordinatesDistance).toHaveBeenCalledTimes(1); // Ensure it was called once
            expect(mockGetCoordinatesDistance).toHaveBeenCalledWith(
                mockMeasurements[0].latitude,
                mockMeasurements[0].longitude,
                mockMeasurements[1].latitude,
                mockMeasurements[1].longitude
            );

            mockGetCoordinatesDistance.mockRestore();
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

            const mockGetCoordinatesDistance = vi
                .spyOn(measurementsService, 'getCoordinatesDistance')
                .mockReturnValue(0); // This should not be called

            const totalDistance = measurementsService.getMeasurementsTotalDistance(mockMeasurements);

            expect(totalDistance).toBe(0); // Ensure it returns 0 for less than 2 measurements
            expect(mockGetCoordinatesDistance).not.toHaveBeenCalled(); // Ensure the function is not called

            mockGetCoordinatesDistance.mockRestore(); // Restore the original implementation
        });

        it('should ignore distances greater than the permitted range', () => {
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.71253,
                    longitude: -77.196,
                },
                {
                    id: 2,
                    nodeId: 1,
                    timestamp: new Date(),
                    o3Value: 0.6,
                    coValue: 1.2,
                    no2Value: 0.8,
                    latitude: 40.71252,
                    longitude: -77.1965,
                },
            ];

            const maxPermittedDistance =
            MAX_PERMITTED_SPEED_MPS * MEASURING_FREQUENCY_SECONDS;
            
            const mockDistance = maxPermittedDistance + 15; // Mock a distance greater than the permissible range
            
            const mockGetCoordinatesDistance = vi
                .spyOn(measurementsService, 'getCoordinatesDistance')
                .mockReturnValue(mockDistance);

            const totalDistance = measurementsService.getMeasurementsTotalDistance(mockMeasurements);

            expect(totalDistance).toBe(0); // Ensure the invalid distance is ignored
            expect(mockGetCoordinatesDistance).toHaveBeenCalledTimes(1);
            expect(mockGetCoordinatesDistance).toHaveBeenCalledWith(
                mockMeasurements[0].latitude,
                mockMeasurements[0].longitude,
                mockMeasurements[1].latitude,
                mockMeasurements[1].longitude
            );

            mockGetCoordinatesDistance.mockRestore(); // Restore the original implementation
        });
    });


    describe('getLastMeasurement()', () => {
        it('should return the last measurement for a user', async () => {
            const userId = 1;
            const mockMeasurement: Measurement = {
                id: 1,
                nodeId: 1,
                timestamp: new Date(),
                o3Value: 0.5,
                coValue: 1.0,
                no2Value: 0.7,
                latitude: 40.7128,
                longitude: -74.006,
            };

            prisma.measurement.findFirst = vi
                .fn()
                .mockResolvedValue(mockMeasurement);

            const result = await measurementsService.getLastMeasurement(userId);

            // Assert only the behavior we care about
            expect(result).toEqual(mockMeasurement); // The function produces the expected output
        });

        it('should return null if no measurement exists for the user', async () => {
            const userId = 1;

            prisma.measurement.findFirst = vi.fn().mockResolvedValue(null);

            const result = await measurementsService.getLastMeasurement(userId);

            // Assert behavior: Function handles "no data" case
            expect(result).toBeNull();
        });

        it('should propagate errors from the database query', async () => {
            const userId = 1;

            prisma.measurement.findFirst = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                measurementsService.getLastMeasurement(userId)
            ).rejects.toThrow('Database error');
        });
    });

    describe('getMeasurementsInRange()', () => {
        it('should return all measurements within a given time range', async () => {
            const userId = 1;
            const timeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-02T00:00:00Z'),
            };
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date('2023-11-01T12:00:00Z'),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
            ];

            prisma.measurement.findMany = vi
                .fn()
                .mockResolvedValue(mockMeasurements);

            const result =
                await measurementsService.getMeasurementsInRange(
                    timeRange
                );

            expect(result).toEqual(mockMeasurements); // Assert the behavior: correct results returned
        });

        it('should return an empty array if no measurements are in the range', async () => {
            const userId = 1;
            const timeRange = { start: new Date(), end: new Date() };

            prisma.measurement.findMany = vi.fn().mockResolvedValue([]);

            const result =
                await measurementsService.getMeasurementsInRange(
                    timeRange
                );

            expect(result).toEqual([]); // Assert behavior: empty array for no data
        });

        it('should propagate errors from the database query', async () => {
            const userId = 1;
            const timeRange = { start: new Date(), end: new Date() };

            prisma.measurement.findMany = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                measurementsService.getMeasurementsInRange(
                    timeRange
                )
            ).rejects.toThrow('Database error');
        });
    });
    
    describe('getUserMeasurementsInRange()', () => {
        it('should return all measurements within a given time range', async () => {
            const userId = 1;
            const timeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-02T00:00:00Z'),
            };
            const mockMeasurements: Measurement[] = [
                {
                    id: 1,
                    nodeId: 1,
                    timestamp: new Date('2023-11-01T12:00:00Z'),
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                },
            ];

            prisma.measurement.findMany = vi
                .fn()
                .mockResolvedValue(mockMeasurements);

            const result = await measurementsService.getUserMeasurementsInRange(
                userId,
                timeRange
            );

            expect(result).toEqual(mockMeasurements); // Assert the behavior: correct results returned
        });

        it('should return an empty array if no measurements are in the range', async () => {
            const userId = 1;
            const timeRange = { start: new Date(), end: new Date() };

            prisma.measurement.findMany = vi.fn().mockResolvedValue([]);

            const result = await measurementsService.getUserMeasurementsInRange(
                userId,
                timeRange
            );

            expect(result).toEqual([]); // Assert behavior: empty array for no data
        });

        it('should propagate errors from the database query', async () => {
            const userId = 1;
            const timeRange = { start: new Date(), end: new Date() };

            prisma.measurement.findMany = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                measurementsService.getUserMeasurementsInRange(userId, timeRange)
            ).rejects.toThrow('Database error');
        });
    });

    describe('getUserAirQualityReadingsInRange()', () => {
        it('should return air quality readings for valid time intervals', async () => {
            const userId = 1;
            const start = new Date('2023-11-01T00:00:00Z');
            const end = new Date('2023-11-01T08:00:00Z');
            const intervalInHours = 2;

            // Mock dependencies
            const mockTimeRanges = [
                {
                    start: new Date('2023-11-01T00:00:00Z'),
                    end: new Date('2023-11-01T02:00:00Z'),
                },
                {
                    start: new Date('2023-11-01T02:00:00Z'),
                    end: new Date('2023-11-01T04:00:00Z'),
                },
            ];
            vi.mocked(airQualityUtils.splitTimeRange).mockReturnValue(mockTimeRanges);

            const mockMeasurements = [
                {
                    id: 1,
                    o3Value: 0.5,
                    coValue: 1.0,
                    no2Value: 0.7,
                    latitude: 40.7128,
                    longitude: -74.006,
                    timestamp: new Date('2023-11-01T00:00:00Z'),
                    nodeId: 1,
                },
            ];

            const mockGetUserMeasurementsInRange = vi
                .spyOn(measurementsService, 'getUserMeasurementsInRange')
                .mockResolvedValueOnce(mockMeasurements) // First interval
                .mockResolvedValueOnce([]); // Second interval with no measurements

            vi.mocked(airQualityUtils.calculateGasAverages).mockReturnValue({
                o3: 0.5,
                co: 1.0,
                no2: 0.7,
            });

            vi.mocked(
                airQualityUtils.getAirQualityReadingFromGasesValues
            ).mockReturnValueOnce({
                timestamp: mockTimeRanges[0].start,
                airQuality: AirQualities.Good,
                proportionalValue: 0.7,
                gas: AirGases.O3,
                ppmValue: 0.5,
            });

            const result =
                await measurementsService.getUserAirQualityReadingsInRange(
                    userId,
                    start,
                    end,
                    intervalInHours
                );

            expect(result).toEqual([
                {
                    timestamp: mockTimeRanges[0].start,
                    airQuality: AirQualities.Good,
                    proportionalValue: 0.7,
                    gas: AirGases.O3,
                    ppmValue: 0.5,
                },
                {
                    timestamp: mockTimeRanges[1].start,
                    airQuality: null,
                    proportionalValue: null,
                    gas: null,
                    ppmValue: null,
                },
            ]);

            mockGetUserMeasurementsInRange.mockRestore();
        });

        it('should return empty intervals when no measurements exist', async () => {
            const userId = 1;
            const start = new Date('2023-11-01T00:00:00Z');
            const end = new Date('2023-11-01T04:00:00Z');
            const intervalInHours = 2;

            const mockTimeRanges = [
                {
                    start: new Date('2023-11-01T00:00:00Z'),
                    end: new Date('2023-11-01T02:00:00Z'),
                },
                {
                    start: new Date('2023-11-01T02:00:00Z'),
                    end: new Date('2023-11-01T04:00:00Z'),
                },
            ];

            vi.mocked(airQualityUtils.splitTimeRange).mockReturnValue(
                mockTimeRanges
            );

            const mockgetUserMeasurementsInRange = vi
                .spyOn(measurementsService, 'getUserMeasurementsInRange')
                .mockResolvedValue([]); // Always empty for this test case

            const result =
                await measurementsService.getUserAirQualityReadingsInRange(
                    userId,
                    start,
                    end,
                    intervalInHours
                );

            expect(result).toEqual([
                {
                    timestamp: mockTimeRanges[0].start,
                    airQuality: null,
                    proportionalValue: null,
                    gas: null,
                    ppmValue: null,
                },
                {
                    timestamp: mockTimeRanges[1].start,
                    airQuality: null,
                    proportionalValue: null,
                    gas: null,
                    ppmValue: null,
                },
            ]);

            mockgetUserMeasurementsInRange.mockRestore();
        });

        it('should propagate errors from getUserMeasurementsInRange', async () => {
            const userId = 1;
            const start = new Date();
            const end = new Date();
            const intervalInHours = 2;

            const mockTimeRanges = [
                {
                    start: new Date('2023-11-01T00:00:00Z'),
                    end: new Date('2023-11-01T02:00:00Z'),
                },
            ];

            vi.mocked(airQualityUtils.splitTimeRange).mockReturnValue(
                mockTimeRanges
            );

            const mockgetUserMeasurementsInRange = vi
                .spyOn(measurementsService, 'getUserMeasurementsInRange')
                .mockRejectedValue(new Error('Database error'));

            await expect(
                measurementsService.getUserAirQualityReadingsInRange(
                    userId,
                    start,
                    end,
                    intervalInHours
                )
            ).rejects.toThrow('Database error');

            mockgetUserMeasurementsInRange.mockRestore();
        });
    });

    describe('getDashboardData()', () => {
        it('should return dashboard data when valid data is available', async () => {
            const userId = 1;

            // Mocking the service methods
            const mockLastMeasurement = {
                id: 1,
                latitude: 40.7128,
                longitude: -74.006,
                nodeId: 1,
                o3Value: 0.5,
                coValue: 1.0,
                no2Value: 0.7,
                timestamp: new Date('2023-11-01T00:00:00Z'),
            };

            const mockTodayTotalDistance = 120; // in kilometers

            const mockAirQualityReadings = [
                {
                    timestamp: new Date('2023-11-01T00:00:00Z'),
                    airQuality: AirQualities.Good,
                    proportionalValue: 0.7,
                    gas: AirGases.O3,
                    ppmValue: 0.5,
                },
                {
                    timestamp: new Date('2023-11-01T02:00:00Z'),
                    airQuality: AirQualities.Regular,
                    proportionalValue: 0.6,
                    gas: AirGases.CO,
                    ppmValue: 1.0,
                },
            ];

            // Spy on service methods
            const getLastMeasurementSpy = vi
                .spyOn(measurementsService, 'getLastMeasurement')
                .mockResolvedValue(mockLastMeasurement);

            const getTodayTotalDistanceSpy = vi
                .spyOn(measurementsService, 'getTodayTotalDistance')
                .mockResolvedValue(mockTodayTotalDistance);

            const getUserAirQualityReadingsInRangeSpy = vi
                .spyOn(measurementsService, 'getUserAirQualityReadingsInRange')
                .mockResolvedValue(mockAirQualityReadings);

            // Mocking the air quality reading calculation
            const mockAirQualityReadingFromGasesValues = vi
                .mocked(airQualityUtils.getAirQualityReadingFromGasesValues)
                .mockReturnValue({
                    timestamp: mockLastMeasurement.timestamp,
                    airQuality: AirQualities.Good,
                    proportionalValue: 0.7,
                    gas: AirGases.O3,
                    ppmValue: 0.5,
                });

            const mockAverageAirQuality = vi
                .mocked(airQualityUtils.getAverageAirQualityFromAirQualityReadings)
                .mockReturnValue(AirQualities.Good);
            
            // Call the function under test
            const result = await measurementsService.getDashboardData(userId);

            // Assertions
            expect(result).toEqual({
                lastAirQualityReading: {
                    timestamp: mockLastMeasurement.timestamp,
                    airQuality: AirQualities.Good,
                    proportionalValue: 0.7,
                    gas: AirGases.O3,
                    ppmValue: 0.5,
                },
                todayDistance: mockTodayTotalDistance,
                airQualityReadingsInfo: {
                    airQualityReadings: mockAirQualityReadings,
                    overallAirQuality: AirQualities.Good,
                }
            });

            // Ensure the mock functions were called correctly
            expect(getLastMeasurementSpy).toHaveBeenCalledWith(userId);
            expect(getTodayTotalDistanceSpy).toHaveBeenCalledWith(userId);
            expect(getUserAirQualityReadingsInRangeSpy).toHaveBeenCalledWith(
                userId,
                expect.any(Date), // start date
                expect.any(Date), // end date
                2 // interval
            );

            // Clean up
            getLastMeasurementSpy.mockRestore();
            getTodayTotalDistanceSpy.mockRestore();
            getUserAirQualityReadingsInRangeSpy.mockRestore();
            mockAirQualityReadingFromGasesValues.mockRestore();
        });

        it('should return null when no last measurement exists', async () => {
            const userId = 1;

            // Spy on getLastMeasurement to return null
            const getLastMeasurementSpy = vi
                .spyOn(measurementsService, 'getLastMeasurement')
                .mockResolvedValue(null);

            const result = await measurementsService.getDashboardData(userId);

            expect(result).toBeNull();

            // Ensure the spy was called correctly
            expect(getLastMeasurementSpy).toHaveBeenCalledWith(userId);

            // Clean up
            getLastMeasurementSpy.mockRestore();
        });
    });

    describe('getGeolocatedAirQualityReadingsInRange', () => {
        it('should return geolocated air quality readings for a valid time range', async () => {
            const mockTimeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-01T08:00:00Z'),
            };

            const mockMeasurements = [
                {
                    id: 1,
                    nodeId: 1,
                    o3Value: 0.05,
                    coValue: 1.2,
                    no2Value: 0.07,
                    latitude: 40.7128,
                    longitude: -74.006,
                    timestamp: new Date('2023-11-01T00:00:00Z'),
                },
                {
                    id: 2,
                    nodeId: 2,
                    o3Value: 0.1,
                    coValue: 1.5,
                    no2Value: 0.09,
                    latitude: 34.0522,
                    longitude: -118.2437,
                    timestamp: new Date('2023-11-01T02:00:00Z'),
                },
            ];

            const mockAirQualityReadings = [
                {
                    timestamp: mockMeasurements[0].timestamp,
                    airQuality: AirQualities.Good,
                    proportionalValue: 0.5,
                    gas: AirGases.O3,
                    ppmValue: 0.05,
                },
                {
                    timestamp: mockMeasurements[1].timestamp,
                    airQuality: AirQualities.Regular,
                    proportionalValue: 0.7,
                    gas: AirGases.CO,
                    ppmValue: 1.5,
                },
            ];

            // Mocking dependencies
            vi.spyOn(
                measurementsService,
                'getMeasurementsInRange'
            ).mockResolvedValue(mockMeasurements);

            vi.spyOn(airQualityUtils, 'getAirQualityReadingFromGasesValues')
                .mockReturnValueOnce(mockAirQualityReadings[0])
                .mockReturnValueOnce(mockAirQualityReadings[1]);

            const result =
                await measurementsService.getGeolocatedAirQualityReadingsInRange(mockTimeRange);

            expect(result).toEqual([
                {
                    ...mockAirQualityReadings[0],
                    latitude: mockMeasurements[0].latitude,
                    longitude: mockMeasurements[0].longitude,
                },
                {
                    ...mockAirQualityReadings[1],
                    latitude: mockMeasurements[1].latitude,
                    longitude: mockMeasurements[1].longitude,
                },
            ]);

            vi.restoreAllMocks();
        });

        it('should return an empty array when no measurements exist', async () => {
            const mockTimeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-01T08:00:00Z'),
            };

            // Mocking dependencies
            vi.spyOn(
                measurementsService,
                'getMeasurementsInRange'
            ).mockResolvedValue([]);

            const result =
                await measurementsService.getGeolocatedAirQualityReadingsInRange(mockTimeRange);

            expect(result).toEqual([]);

            vi.restoreAllMocks();
        });

        it('should propagate errors from getMeasurementsInRange', async () => {
            const mockTimeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-01T08:00:00Z'),
            };

            // Mocking dependencies
            vi.spyOn(
                measurementsService,
                'getMeasurementsInRange'
            ).mockRejectedValue(new Error('Database error'));

            await expect(
                measurementsService.getGeolocatedAirQualityReadingsInRange(mockTimeRange)
            ).rejects.toThrow('Database error');

            vi.restoreAllMocks();
        });

        it('should handle errors in air quality reading computation gracefully', async () => {
            const mockTimeRange = {
                start: new Date('2023-11-01T00:00:00Z'),
                end: new Date('2023-11-01T08:00:00Z'),
            };

            const mockMeasurements = [
                {
                    id: 1,
                    nodeId: 1,
                    o3Value: 0.05,
                    coValue: 1.2,
                    no2Value: 0.07,
                    latitude: 40.7128,
                    longitude: -74.006,
                    timestamp: new Date('2023-11-01T00:00:00Z'),
                },
            ];

            // Mocking dependencies
            vi.spyOn(
                measurementsService,
                'getMeasurementsInRange'
            ).mockResolvedValue(mockMeasurements);

            vi.spyOn(
                airQualityUtils,
                'getAirQualityReadingFromGasesValues'
            ).mockImplementation(() => {
                throw new Error('Error calculating air quality');
            });

            await expect(
                measurementsService.getGeolocatedAirQualityReadingsInRange(mockTimeRange)
            ).rejects.toThrow('Error calculating air quality');

            vi.restoreAllMocks();
        });
    });
});
