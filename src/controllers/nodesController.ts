/**
 * @file nodesController.ts
 * @brief Controller to handle measurement-related operations.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { nodesService } from '../services/nodesService';

/**
 * Method in nodesController.ts to link a node to a user in the database.
 *
 * @param req - HTTP request object of type `Request`. Contains the nodeId in the params.
 * @param res - HTTP response object of type `Response`. Used to return responses to the client.
 *
 * @returns Returns a JSON object with the updated node and HTTP status 201 if successful, or an error in JSON format with HTTP status 400 or 500.
 */

const linkNodeToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }
    
        const { nodeId: nodeIdString } = req.params;
        const nodeId = parseInt(nodeIdString, 10);
    
        const existingNode = await nodesService.findNodeById(nodeId);
    
        if (!existingNode) {
            return res.status(400).json({ message: 'Node not found' });
        }
    
        const nodeIsActive = await nodesService.checkIfNodeIsActive(nodeId);
        if (nodeIsActive) {
            return res.status(400).json({
                message: 'Node is already linked to an active user',
            });
        }
    
        const userId = req.userId;
    
        const linkedNode = await nodesService.linkNodeToUser(nodeId, userId);
    
        return res.status(200).json(linkedNode);
    } catch (error) {
        next(error);
    }
};

export const nodesController = {
    linkNodeToUser,
};
