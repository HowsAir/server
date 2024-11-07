/**
 * @file usersRoutes.ts
 * @brief Routes for user operations
 * @author Juan Diaz
 */

import { Router} from 'express';
import { check, body } from 'express-validator';
import { usersController } from '../controllers/usersController';
import {
    verifyToken,
    verifyResetPasswordToken,
    authorizeRoles,
} from '../middleware/auth';
import { passwordValidationRules } from '../utils/validators';
import multer from 'multer';

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

router.patch(
    '/profile',
    verifyToken,
    [
        check('name', 'Name is not a valid string').optional().notEmpty(),
        check('surnames', 'Surnames is not a valid string')
            .optional()
            .notEmpty(),
        body().custom((body) => {
            if (!body.name && !body.surnames) {
                throw new Error(
                    'At least one of name or surnames must be provided'
                );
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
        ...passwordValidationRules('newPassword'), // Using the validation function here
    ],
    usersController.changePassword
);

router.post(
    '/reset-password',
    verifyResetPasswordToken,
    [
        ...passwordValidationRules('newPassword'), // Reusing the same validation rules
    ],
    usersController.resetPassword
);

router.put(
    '/photo',
    verifyToken,
    upload.single('photo'),
    [
        check('photo').custom((_, { req }) => {
            const file = req.file;

            if (!file) {
                throw new Error('Photo is required and needs to be valid');
            }

            if (
                file.mimetype !== 'image/jpeg' &&
                file.mimetype !== 'image/png'
            ) {
                throw new Error('Only JPEG and PNG files are allowed');
            }
            return true;
        }),
    ],
    usersController.updateProfilePhoto
);

router.get(
    '/today-total-distance',
    verifyToken,
    usersController.getTodayTotalDistance
);

/*
const authorizeAdminRole = authorizeRoles(2)
router.get(
    '/',
    verifyToken,
    authorizeAdminRole,
    usersController.getUsersRegistry
);*/
export default router;
