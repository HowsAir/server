import { check, ValidationChain } from 'express-validator';

export const passwordValidationRules = (
    fieldName = 'password'
): ValidationChain[] => [
    check(fieldName)
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
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
