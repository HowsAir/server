/**
 * @file measurementsController.ts
 * @brief Controller to handle measurement-related operations.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { measurementsService } from '../services/measurementsService';
import { Measurement } from '@prisma/client';

/**
 * Method in measurementsController.ts to save a new measurement in the database.
 *
 * @param req - HTTP request object of type `Request`. Contains the measurement data in the body.
 * @param res - HTTP response object of type `Response`. Used to return responses to the client.
 *
 * @returns Returns a JSON object with the saved measurement and HTTP status 201 if successful, or an error in JSON format with HTTP status 400 or 500.
 */

const createMeasurement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { o3Value, latitude, longitude } = req.body;

        const userId = req.userId;

        const createdMeasurement: Measurement =
            await measurementsService.createMeasurement(
                o3Value,
                latitude,
                longitude,
                userId
            );

        return res.status(201).json(createdMeasurement);
    } catch (error) {
        next(error);
    }
};

export const measurementsController = {
    createMeasurement,
};
