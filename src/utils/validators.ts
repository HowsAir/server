import { check, ValidationChain } from 'express-validator';

export const passwordValidationRules = (fieldName = 'password'): ValidationChain[] => [
    check(fieldName)
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password needs to be 6 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&.]/)
        .withMessage(
            'Password must contain at least one special character (@$!%*?&.)'
        ),
];
