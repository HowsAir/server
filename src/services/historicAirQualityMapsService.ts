/**
 * @file historicAirQualityMapsService.ts
 * @brief Service to manage operations related to historic air quality maps
 * @autor Juan Diaz
 */

import { HistoricAirQualityMap } from '@prisma/client';
import prisma from '../libs/prisma';
import { CalendarMetadata } from '../types/historicAirQualityMaps/CalendarMetada';

/**
 * Saves a historic air quality map with a given URL and timestamp.
 *
 * { String: url, Date: timestamp } -> saveHistoricAirQualityMap() -> Promise<HistoricAirQualityMap>
 *
 * @param {string} url - The URL of the air quality map to save.
 * @param {Date} timestamp - The timestamp associated with the air quality map.
 * @returns {Promise<HistoricAirQualityMap>} - A promise that resolves to the saved map entry.
 * @throws {Error} If there is an issue while saving the map or if the URL/timestamp already exists.
 */
const saveHistoricAirQualityMap = async (
    url: string,
    timestamp: Date
): Promise<HistoricAirQualityMap> => {
    return await prisma.historicAirQualityMap.create({
        data: {
            url,
            timestamp,
        },
    });
};

/**
 * Retrieves the most recent historic air quality map.
 * 
 * getLastHistoricAirQualityMap() -> Promise<HistoricAirQualityMap | null>
 * 
 * @returns {Promise<HistoricAirQualityMap | null>} - A promise that resolves to the most recent historic air quality map.
 * @throws {Error} If there is an issue while fetching the map.
 */
const getLastHistoricAirQualityMap = async (): Promise<HistoricAirQualityMap | null> => {
    return await prisma.historicAirQualityMap.findFirst({
        orderBy: {
            timestamp: 'desc',
        },
    });
}

/**
 * Retrieves the calendar metadata for a specific year and month.
 * 
 * getCalendarMetadata() -> Promise<CalendarMetadata>
 * 
 * @param {number} year - The year for which to retrieve the calendar metadata.
 * @param {number} month - The month for which to retrieve the calendar metadata.
 * @returns {Promise<CalendarMetadata>} - A promise that resolves to the calendar metadata for the given year and month.
 * @throws {Error} If there is an issue while fetching the metadata.
 */
const getCalendarMetadata = async (year: number, month: number): Promise<CalendarMetadata> => {
    const firstMap = await prisma.historicAirQualityMap.findFirst({
        orderBy: {
            timestamp: 'asc', 
        },
    });

    const firstAvailableYear = firstMap ? firstMap.timestamp.getFullYear() : null;

    const maps = await prisma.historicAirQualityMap.findMany({
        where: {
            timestamp: {
                gte: new Date(year, month - 1, 1), // Start of the month
                lt: new Date(year, month, 1), // Start of the next month
            },
        },
        orderBy: {
            timestamp: 'asc',
        },
    });

    if (maps.length === 0) {
        return {
            firstAvailableYear,
            year,
            month,
            availableDates: [],
        };
    }

    // Process the maps to group them by date, storing times as an array
    const availableDates = maps.reduce((acc, map) => {
        const dateStr = map.timestamp.toISOString().split('T')[0]; // Extract the date (YYYY-MM-DD)
        const timeStr = map.timestamp.toISOString().split('T')[1]; // Extract the time (HH:mm:ss)

        // If the date is not in the accumulator, initialize it as an empty array
        if (!acc[dateStr]) {
            acc[dateStr] = {
                date: new Date(dateStr),
                times: [],
            };
        }

        // Push the time to the corresponding date
        acc[dateStr].times.push(timeStr);

        return acc;
    }, {} as Record<string, { date: Date; times: string[] }>);

    const availableDatesArray = Object.values(availableDates);

    return {
        firstAvailableYear,
        year,
        month,
        availableDates: availableDatesArray,
    };
};


/**
 * 
 * Retrieves a historic air quality map given a timestamp.
 * 
 * getHistoricAirQualityMap() -> Promise<HistoricAirQualityMap>
 * 
 * @returns {Promise<HistoricAirQualityMap>} - A promise that resolves to a historic air quality map.
 * @throws {Error} If there is an issue while fetching the map.
 */
const getHistoricAirQualityMap = async (timestamp: Date): Promise<HistoricAirQualityMap | null> => {
    return await prisma.historicAirQualityMap.findFirst({
        where: {
            timestamp: timestamp, 
        },
    });
}

export const historicAirQualityMapsService = {
    saveHistoricAirQualityMap,
    getLastHistoricAirQualityMap,
    getCalendarMetadata,
    getHistoricAirQualityMap,
};
