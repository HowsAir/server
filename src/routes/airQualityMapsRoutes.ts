/**
 * @file mapsRoutes.ts
 * @brief Routes definition for the API's nodes operations.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { airQualityMapsController } from '../controllers/airQualityMapsController';
import { check, param } from 'express-validator';
import { UserRoleId } from '../types/users/UserRoleId';
import {
    verifyToken,
    authorizeRoles,
} from '../middleware/auth';

const router = Router();

// The routes which use this middleware are protected and only accessible by Admin users
const authorizeAdminRole = authorizeRoles(UserRoleId.Admin);

router.get(
    '/current',
    airQualityMapsController.getCurrentAirQualityMap
);

router.get(
    '/calendar-metadata',
    verifyToken,
    authorizeAdminRole,
    [
        check('year', 'Year is required and must be a number').isInt(),
        check('month', 'Month is required and must be a number between 1 and 12').isInt({ min: 1, max: 12 }),
    ],
    airQualityMapsController.getCalendarMetadata
);

router.get(
    '/:timestamp',
    verifyToken,
    authorizeAdminRole,
    [
        param('timestamp', 'Timestamp is required and must be a valid ISO 8601 date').isISO8601(),
    ],
    airQualityMapsController.getAirQualityMapByTimestamp
);

export default router;
