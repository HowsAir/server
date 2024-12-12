/**
 * @file router.ts
 * @brief API's main routes configuration file
 * @author Juan Diaz
 */

import { Router } from 'express';
import measurementsRoutes from './measurementsRoutes';
import usersRoutes from './usersRoutes';
import authRoutes from './authRoutes';
import checkoutRoutes from './checkoutRoutes';
import nodesRoutes from './nodesRoutes';
import airQualityMapsRoutes from './airQualityMapsRoutes';

const router = Router();

router.use('/measurements', measurementsRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/nodes', nodesRoutes);
router.use('/air-quality-maps', airQualityMapsRoutes)

export default router;