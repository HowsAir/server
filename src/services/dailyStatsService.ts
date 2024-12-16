/**
 * @file dailyStatsService.ts
 * @brief Service to manage operations related to daily stats and distances
 * @autor Juan Diaz
 */

import prisma from '../libs/prisma';
import { measurementsService } from './measurementsService';

/**
 * Retrieves the total distance covered by a user in the current month
 *
 * Number: userId -> getCurrentMonthDistance() -> Promise<Number>
 * 
 * @param userId The user ID for whom the total distance is calculated.
 * @returns {Promise<number>} A promise that resolves to the total distance covered in the current month.
 * @throws {Error} If there is an issue while retrieving the data.
 */
const getCurrentMonthDistance = async (userId: number): Promise<number> => {
    const currentDate = new Date();

    // Set the start of the current month (1st day of the month)
    const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );

    const dailyStats = await prisma.dailyStat.findMany({
        where: {
            userId,
            date: {
                gte: startOfMonth,
                lte: currentDate,
            },
        },
        select: {
            distance: true,
        },
    });

    let currentMonthDistance = dailyStats.reduce(
        (sum, stat) => sum + stat.distance,
        0
    );

    currentMonthDistance = Math.round(currentMonthDistance);

    const todayTotalDistance =
        await measurementsService.getTodayTotalDistance(userId);
    
    return currentMonthDistance + todayTotalDistance;
};

export const dailyStatsService = {
    getCurrentMonthDistance,
};
