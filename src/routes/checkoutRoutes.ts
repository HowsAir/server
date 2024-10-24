/**
 * @file paymentRoutes.ts
 * @brief Definition of the routes for payment processing in the API.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { checkoutController } from '../controllers/checkoutController';
import { check } from 'express-validator';

const router = Router();

/**
 * Route to create a checkout session for Stripe payments.
 */
router.post(
    '/',
    [check('amount', 'Amount is required').isNumeric().notEmpty()],
    checkoutController.createCheckoutSession
);

export default router;
