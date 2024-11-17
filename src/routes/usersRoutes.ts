/**
 * @file usersRoutes.ts
 * @brief Routes for user operations
 * @author Juan Diaz
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { usersController } from '../controllers/usersController';
import {
    verifyToken,
    verifyResetPasswordToken,
    authorizeRoles,
} from '../middleware/auth';
import { passwordValidationRules } from '../utils/validators';
import multer from 'multer';
import { UserRoleId } from '../types/UserRoleId';

const router = Router();

const fileSizeLimitInMb = 5;
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * fileSizeLimitInMb,
    },
});

router.post(
    '/',
    [
        check('email', 'Email is required and needs to be valid').isEmail(),
        ...passwordValidationRules('password'),
        check('name', 'Name is required and cannot be empty').notEmpty(),
        check(
            'surnames',
            'Surnames are required and cannot be empty'
        ).notEmpty(),
        check('phone', 'Phone is required and cannot be empty')
            .notEmpty()
            .isNumeric(),
        check('country', 'Country is required and cannot be empty').notEmpty(),
        check('city', 'City is required and cannot be empty').notEmpty(),
        check('address', 'Address is required and cannot be empty').notEmpty(),
        check('zipCode', 'Zip code is required and cannot be empty')
            .notEmpty()
            .isNumeric(),
    ],
    usersController.register
);

router.post(
    '/admin',
    [
        check('email', 'Email is required and needs to be valid').isEmail(),
        ...passwordValidationRules('password'),
        check('name', 'Name is required and cannot be empty').notEmpty(),
        check('surnames', 'Surnames are required and cannot be empty').notEmpty(),
        check('authorizationCode', 'Authorization code is required').notEmpty(),
    ],
    usersController.registerAdmin
);

router.get(
    '/profile',
    verifyToken,
    usersController.getProfile
);

router.patch(
    '/profile',
    verifyToken,
    upload.single('photo'),
    [
        check('name', 'Name is not a valid string').optional().notEmpty(),
        check('surnames', 'Surnames is not a valid string')
            .optional()
            .notEmpty(),
        check('photo').custom((_, { req }) => {
            const file = req.file;
            if (!file) return true;
            if (
                file.mimetype !== 'image/jpeg' &&
                file.mimetype !== 'image/png'
            ) {
                throw new Error('Only JPEG and PNG files are allowed');
            }
            return true;
        }),
    ],
    usersController.updateProfile
);

router.put(
    '/password',
    verifyToken,
    [
        check('currentPassword')
            .notEmpty()
            .withMessage('Current password is required')
            .isLength({ min: 8 })
            .withMessage('Current password needs to be 8 characters long'),
        ...passwordValidationRules('newPassword'),
    ],
    usersController.changePassword
);

router.put(
    '/reset-password',
    verifyResetPasswordToken,
    [...passwordValidationRules('newPassword')],
    usersController.resetPassword
);

router.get(
    '/node',
    verifyToken,
    usersController.getNode
);

router.get(
    '/today-total-distance',
    verifyToken,
    usersController.getTodayTotalDistance
);

// This route is protected and only accessible by Admin users
const authorizeAdminRole = authorizeRoles(UserRoleId.Admin);
router.get(
    '/statistics',
    verifyToken,
    authorizeAdminRole,
    usersController.getStatistics
);

export default router;
