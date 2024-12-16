/**
 * @file mapsRoutes.ts
 * @brief Routes definition for the API's nodes operations.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { airQualityMapsController } from '../controllers/airQualityMapsController';

const router = Router();

router.get(
    '/current',
    airQualityMapsController.getCurrentAirQualityMap
);

export default router;
