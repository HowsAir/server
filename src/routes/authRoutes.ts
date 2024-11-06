/**
 * @file authRoutes.ts
 * @brief Definition of the routes for authentication in the API
 * @author Juan Diaz & Manuel Borregales
 */

import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { verifiedEmailMatches, verifyToken } from '../middleware/auth';
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

// Route for validating JWT, passing through verifyToken middleware
router.get('/validate', verifyToken, async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Token is valid' });
});

router.post('/logout', authController.logout);

router.post(
    '/forgot-password',
    [check('email', 'Valid email is required').isEmail()],
    authController.forgotPassword
);

router.post(
    '/verify-reset-code',
    [
        check('email', 'Valid email is required').isEmail(),
        check('code', 'Six digit reset code is required').isLength({
            min: 6,
            max: 6,
        }),
    ],
    authController.verifyResetCode
);

// Sends an email to the user with its own email encrypted on a link that looks like this:
router.post(
    '/send-confirmation-email',
    [check('email', 'Valid email is required').isEmail()],
    authController.sendConfirmationEmail
);

// Receives the token from the link obtained in the email of confirm-email, gets the email from the link after decrypting the token.
// You will access this endpoint by this URL: http://localhost:3000/verify-email-token?token=encryptedEmail.
router.post(
    '/create-email-verification-token',
    authController.createEmailVerificationToken
);

// // Receives the email from the first endpoint, to verify if it matches with the email encrypted on the cookie.
// router.post(
//     '/confirm-email',
//     [check('email', 'Valid email is required').isEmail()],
//     verifiedEmailMatches,
//     authController.confirmEmail
// );

export default router;
