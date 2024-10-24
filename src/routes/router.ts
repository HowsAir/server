/**
 * @file router.ts
 * @brief API's main routes configuration file
 * @author Juan Diaz
 */

import { Router } from 'express';
//import medicionRoutes from "./medicionesRoutes"
import usersRoutes from './usersRoutes';
import authRoutes from './authRoutes';
import checkoutRoutes from './checkoutRoutes';

const router = Router();

//router.use("/measurements", medicionRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/checkout', checkoutRoutes);

export default router;
