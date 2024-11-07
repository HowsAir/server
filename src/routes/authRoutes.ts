/**
 * @file authRoutes.ts
 * @brief Definition of the routes for authentication in the API
 * @author Juan Diaz & Manuel Borregales
 */

import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { verifyEmailConfirmedToken, verifyToken } from '../middleware/auth';
import { check } from 'express-validator';

const router = Router();

router.post(
    '/login',
    [
        check('email', 'Email is required').isEmail(),
        check(
            'password',
            'Password with 6 or more characters is required'
        ).isLength({
            min: 6,
        }),
    ],
    authController.login
);

router.get('/validate', verifyToken, async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Token is valid' });
});

router.post('/logout', authController.logout);

router.post(
    '/forgot-password-code',
    [
        check('email', 'Valid email is required').isEmail()
    ],
    authController.forgotPassword
);

router.get(
    '/forgot-password-token',
    [
        check('email', 'Valid email is required').isEmail(),
        check('code', 'Six digit reset code is required').isLength({
            min: 6,
            max: 6,
        }),
    ],
    authController.verifyResetCode
);

router.post(
    '/confirmation-email',
    [
        check('email', 'Valid email is required').isEmail()
    ],
    authController.sendConfirmationEmail
);

router.get(
    '/email-confirmation-token',
    [
        check('token', 'Valid token is required').isString()
    ],
    authController.createEmailVerificationToken
);

router.get(
    '/validate-email-confirmation-token',
    verifyEmailConfirmedToken,
    [
        check('email', 'Valid email is required').isEmail()
    ],
    authController.confirmEmail
);

export default router;
