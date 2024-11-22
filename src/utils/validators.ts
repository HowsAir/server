import { check, ValidationChain } from 'express-validator';

export const passwordValidationRules = (
    fieldName = 'password'
): ValidationChain[] => [
    check(fieldName)
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password needs to be 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&.]/)
        .withMessage(
            'Password must contain at least one special character (@$!%*?&.)'
        ),
];
