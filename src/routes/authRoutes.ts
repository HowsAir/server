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
            'Password with 8 or more characters is required'
        ).isLength({
            min: 8,
        }),
    ],
    authController.login
);

router.get('/validate', verifyToken, async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Token is valid', roleId: req.roleId });
});

router.post('/logout', authController.logout);

router.post(
    '/forgot-password-code',
    [check('email', 'Valid email is required').isEmail()],
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
    [check('email', 'Valid email is required').isEmail()],
    authController.sendConfirmationEmail
);

router.get(
    '/email-confirmation-token',
    [check('token', 'Valid token is required').isString()],
    authController.createEmailVerificationToken
);

router.get(
    '/validate-email-confirmation-token',
    verifyEmailConfirmedToken,
    [check('email', 'Valid email is required').isEmail()],
    authController.confirmEmail
);

router.post(
    '/free-breeze-application',
    [
        check('name', 'Name is required and cannot be empty').notEmpty(),
        check(
            'surnames',
            'Surnames are required and cannot be empty'
        ).notEmpty(),
        check('email', 'Email is required and needs to be valid').isEmail(),
        check('country', 'Country is required and cannot be empty').notEmpty(),
        check('country', 'Country must be España').equals('España'),
        check('city', 'City is required and cannot be empty').notEmpty(),
        check('city', 'City must be Valencia').equals('Valencia'),
        check('address', 'Address is required and cannot be empty').notEmpty(),
        check('zipCode', 'Zip code is required and cannot be empty')
            .notEmpty()
            .isNumeric(),
        check(
            'comments',
            'Comments are required and cannot be empty'
        ).notEmpty(),
    ],
    authController.sendApplicationEmail
);

export default router;
