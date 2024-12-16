/**
 * @file dailyStatsService.test.ts
 * @brief Unit tests for the measurements service
 * @author Juan Diaz
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dailyStatsService } from '../../src/services/dailyStatsService';
import { measurementsService } from '../../src/services/measurementsService';
import prisma from '../../src/libs/prisma';

vi.mock('../../src/libs/prisma');
vi.mock('../../src/services/measurementsService');

describe('getCurrentMonthDistance()', () => {
    const userId = 1; // ID del usuario ficticio para las pruebas

    it('should return the correct total distance for the current month', async () => {
        // Datos simulados de las distancias recorridas
        const mockData = [
            { distance: 1000 }, // 1km
            { distance: 2000 }, // 2km
            { distance: 1500 }, // 1.5km
        ];

        const mockTodayTotalDistance = 500; // 500m

        prisma.dailyStat.findMany = vi.fn().mockResolvedValue(mockData);

        const mockGetTodayTotalDistance = vi
            .spyOn(measurementsService, 'getTodayTotalDistance')
            .mockResolvedValueOnce(mockTodayTotalDistance);
        
        const result = await dailyStatsService.getCurrentMonthDistance(userId);

        expect(result).toBe(5000);

        mockGetTodayTotalDistance.mockRestore();
    });

    it('should return 0 if no distance data is found for the current month', async () => {
        const mockData: any[] = [];

        prisma.dailyStat.findMany = vi.fn().mockResolvedValue(mockData);

        const mockGetTodayTotalDistance = vi
            .spyOn(measurementsService, 'getTodayTotalDistance')
            .mockResolvedValueOnce(0);

        const result = await dailyStatsService.getCurrentMonthDistance(userId);

        expect(result).toBe(0); // Si no hay datos, el resultado debe ser 0
    });

    it('should return the correct total distance for the current month if there is no data for today', async () => {
        const mockData = [
            { distance: 1000 }, // 1km
            { distance: 2000 }, // 2km
            { distance: 1500 }, // 1.5km
        ];

        prisma.dailyStat.findMany = vi.fn().mockResolvedValue(mockData);

        const mockGetTodayTotalDistance = vi
            .spyOn(measurementsService, 'getTodayTotalDistance')
            .mockResolvedValueOnce(0);

        const result = await dailyStatsService.getCurrentMonthDistance(userId);

        expect(result).toBe(4500);

        mockGetTodayTotalDistance.mockRestore();
    });

    it('should return the correct total distance when there is only data for today', async () => {
        const mockData = []; // 1km

        const mockTodayTotalDistance = 100; // 100m

        prisma.dailyStat.findMany = vi.fn().mockResolvedValue(mockData);

        const mockGetTodayTotalDistance = vi
            .spyOn(measurementsService, 'getTodayTotalDistance')
            .mockResolvedValueOnce(mockTodayTotalDistance);

        const result = await dailyStatsService.getCurrentMonthDistance(userId);

        expect(result).toBe(100);

        mockGetTodayTotalDistance.mockRestore();
    });

    it('should handle errors gracefully', async () => {
        prisma.dailyStat.findMany = vi.fn().mockRejectedValue(new Error('Database error'));

        await expect(
            dailyStatsService.getCurrentMonthDistance(userId)
        ).rejects.toThrow('Database error');
    });
});
