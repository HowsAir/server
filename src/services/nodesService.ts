/**
 * @file nodesService.ts
 * @brief Service to manage operations related to nodes.
 * @autor
 */

import { Node, NodeStatus } from '@prisma/client';
import prisma from '../libs/prisma';

/**
 * Links an existing node to a specified user in the database.
 *
 * @param nodeId - The ID of the node to be linked.
 * @param userId - The user ID to link the node to.
 * @returns {Promise<Node>} A promise that resolves to the updated node object with the linked user.
 * @throws {Error} If no node is found with the specified ID or if linking fails.
 */
const linkNodeToUser = async (
    nodeId: number,
    userId: number
): Promise<Node> => {
    return await prisma.node.update({
        where: { id: nodeId },
        data: {
            userId,
            status: NodeStatus.ACTIVE,
            lastStatusUpdate: new Date(),
        },
    });
};

/**
 * Retrieves a node by its ID.
 *
 * @param nodeId - The ID of the node to be retrieved.
 * @returns {Promise<Node | null>} A promise that resolves to the node object if found, or null otherwise.
 */
const findNodeById = async (nodeId: number): Promise<Node | null> => {
    return await prisma.node.findUnique({
        where: { id: nodeId },
    });
};

/**
 * Checks if a node is already linked to an active user.
 *
 * @param nodeId - The ID of the node to check.
 * @returns {Promise<Boolean>} A promise that resolves to true if the node is active, or false otherwise.
 * @throws {Error} If there is an issue while checking the node's linked status.
 */
const checkIfNodeIsActive = async (nodeId: number): Promise<boolean> => {
    const activeNode = await prisma.node.findFirst({
        where: { id: nodeId, NOT: { status: NodeStatus.UNLINKED } },
    });

    return activeNode ? true : false;
};

export const nodesService = {
    linkNodeToUser,
    findNodeById,
    checkIfNodeIsActive,
};
