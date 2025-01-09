/**
 * @file airQualityMapsController.ts
 * @brief Controller for handling air quality maps operations.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import { historicAirQualityMapsService } from '../services/historicAirQualityMapsService';
import { validationResult } from 'express-validator';

/**
 * Gets the last and current air quality map url so that the client can
 * fetch it afterwards
 *
 * @param req - The HTTP request containing the amount in the body.
 * @param res - The HTTP response object to send the session ID.
 * @returns {Promise<Response>} - Returns the map html url from the CDN
 */
const getCurrentAirQualityMap = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const currentHistoricAirQualityMap =
            await historicAirQualityMapsService.getLastHistoricAirQualityMap() 
        
        if (!currentHistoricAirQualityMap) {
            return res.status(404).json({ message: 'No current air quality map found' });
        }
        
        return res.status(200).json({
            id: currentHistoricAirQualityMap.id,
            url: currentHistoricAirQualityMap.url,
            timestamp: currentHistoricAirQualityMap.timestamp
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Gets calendar metadata for a specific year and month.
 * @param req - The HTTP request containing year and month as query parameters.
 * @param res - The HTTP response object.
 * @returns {Promise<Response>} - Returns the calendar metadata for the given year and month.
 */
const getCalendarMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required' });
        }

        const calendarMetadata = await historicAirQualityMapsService.getCalendarMetadata(
            parseInt(year as string, 10),
            parseInt(month as string, 10)
        );

        return res.status(200).json(calendarMetadata);
    } catch (error) {
        next(error);
    }
};

/**
 * Gets the air quality map URL for a specific timestamp.
 * @param req - The HTTP request containing timestamp as a path parameter.
 * @param res - The HTTP response object.
 * @returns {Promise<Response>} - Returns the map html url from the CDN for the given timestamp.
 */
const getAirQualityMapByTimestamp = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }   

        const { timestamp } = req.params;

        const map = await historicAirQualityMapsService.getHistoricAirQualityMap(new Date(timestamp));
        if (!map) {
            return res.status(404).json({ message: 'No map found for the given timestamp' });
        }

        return res.status(200).json({
            id: map.id,
            url: map.url,
            timestamp: map.timestamp,
        });
    } catch (error) {
        next(error);
    }
};

export const airQualityMapsController = {
    getCurrentAirQualityMap,
    getAirQualityMapByTimestamp,
    getCalendarMetadata,
};
