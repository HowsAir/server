/**
 * @file historicAirQualityMapsService.ts
 * @brief Service to manage operations related to historic air quality maps
 * @autor Juan Diaz
 */

import { HistoricAirQualityMap } from '@prisma/client';
import prisma from '../libs/prisma';

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
 * 
 * Retrieves all historic air quality maps.
 * 
 * getHistoricAirQualityMaps() -> Promise<HistoricAirQualityMap[]>
 * 
 * @returns {Promise<HistoricAirQualityMap[]>} - A promise that resolves to an array of all historic air quality maps.
 * @throws {Error} If there is an issue while fetching the maps.
 */
const getHistoricAirQualityMaps = async (): Promise<HistoricAirQualityMap[]> => {
    return await prisma.historicAirQualityMap.findMany(
        {
            orderBy: {
                timestamp: 'desc',
            },
        }
    );
}


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

export const historicAirQualityMapsService = {
    saveHistoricAirQualityMap,
    getHistoricAirQualityMaps,
    getLastHistoricAirQualityMap,
};
