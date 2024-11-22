/**
 * @file medicionesRoutes.ts
 * @brief Routes definition for the API's measurements operations.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { measurementsController } from '../controllers/measurementsController';
import { check } from 'express-validator';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post(
    '/',
    verifyToken,
    [
        check(
            'o3Value',
            'O3 Value is required and should be a float'
        ).isFloat(),
        check(
            'latitude',
            'Latitude is required and should be a float'
        ).isFloat(),
        check(
            'longitude',
            'Longitude is required and should be a float'
        ).isFloat(),
    ],
    measurementsController.createMeasurement
);

router.get('/', measurementsController.getMeasurements);

export default router;
