/**
 * @file checkoutRoutes.ts
 * @brief Definition of the routes for checkout operations in the API.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { checkoutController } from '../controllers/checkoutController';
import { check } from 'express-validator';

const router = Router();

/**
 * Route to create a checkout session for Stripe payment checkouts.
 */
router.post(
    '/',
    [
        check('amount', 'Amount is required and should be numeric')
            .isNumeric()
            .notEmpty(),
    ],
    checkoutController.createCheckoutSession
);

export default router;
