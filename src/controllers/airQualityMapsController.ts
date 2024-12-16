/**
 * @file airQualityMapsController.ts
 * @brief Controller for handling air quality maps operations.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import { historicAirQualityMapsService } from '../services/historicAirQualityMapsService';

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
        
        return res.status(200).json({ url: currentHistoricAirQualityMap.url, timestamp: currentHistoricAirQualityMap.timestamp });
    } catch (error) {
        next(error);
    }
};

export const airQualityMapsController = {
    getCurrentAirQualityMap,
};
