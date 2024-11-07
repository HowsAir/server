/**
 * @file nodesRoutes.ts
 * @brief Routes definition for the API's nodes operations.
 * @author Juan Diaz
 */

import { Router } from 'express';
import { nodesController } from '../controllers/nodesController';
import { check } from 'express-validator';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.put(
    '/:nodeId/link',
    verifyToken,
    [check('nodeId', 'Node ID is required').isInt()],
    nodesController.linkNodeToUser
);

export default router;
