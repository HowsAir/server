/**
 * @file usersRoutes.ts
 * @brief Routes for user operations
 * @author Juan Diaz
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { usersController } from '../controllers/usersController';

const router = Router();

router.post(
    '/',
    [
        check('email', 'Email is required').isEmail(),
        check(
            'password',
            'Password with 6 or more characters is required'
        ).isLength({
            min: 6,
        }),
        check('name', 'Name is required').isString(),
        check('surnames', 'Surnames are required').isString(),
    ],
    usersController.register
);

export default router;
