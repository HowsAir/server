/**
 * @file checkoutController.ts
 * @brief Controller for handling payment-related operations.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import 'dotenv/config';
import { validationResult } from 'express-validator';

const product = {
    name: 'Breeze',
    description: 'Tu nodo monitor de calidad del aire',
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Creates a checkout session for Stripe.
 *
 * @param req - The HTTP request containing the amount in the body.
 * @param res - The HTTP response object to send the session ID.
 * @returns {Promise<Response>} - Returns the session ID
 */
const createCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }
        const { amount } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Specify the payment method type
            line_items: [
                {
                    price_data: {
                        currency: 'eur', // Change the currency as per your requirement
                        product_data: product,
                        unit_amount: amount * 100, // Amount in cents
                    },
                    quantity: 1, // Quantity of the product
                },
            ],
            mode: 'payment', // Set the mode to payment
            success_url: `${process.env.FRONTEND_URL}/payment-success`, // URL to redirect on successful payment
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`, // URL to redirect if payment is canceled
        });

        // Return the session ID to the client
        return res.status(201).json({ id: session.id });
    } catch (error) {
        next(error);
    }
};

export const checkoutController = {
    createCheckoutSession,
};
