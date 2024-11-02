/**
 * @file nodesService.test.ts
 * @brief Unit tests for the nodes service
 * @author Juan Diaz
 */

import { expect, describe, it, vi, beforeEach } from 'vitest';
import { nodesService } from '../../src/services/nodesService';
import prisma from '../../src/libs/prisma';
import { Node, NodeStatus } from '@prisma/client';

vi.mock('../../src/libs/prisma');

describe('nodesService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('linkNodeToUser()', () => {
        it('should link a node to a user and update its status to ACTIVE', async () => {
            const nodeId = 1;
            const userId = 123;
            const linkedNode: Node = {
                id: nodeId,
                userId,
                status: NodeStatus.ACTIVE,
                lastStatusUpdate: new Date(),
            };

            prisma.node.update = vi.fn().mockResolvedValue(linkedNode);

            const result = await nodesService.linkNodeToUser(nodeId, userId);

            expect(result).toStrictEqual(linkedNode);
            expect(prisma.node.update).toHaveBeenCalledWith({
                where: { id: nodeId },
                data: {
                    userId,
                    status: NodeStatus.ACTIVE,
                    lastStatusUpdate: expect.any(Date),
                },
            });
        });

        it('should throw an error if linking the node fails', async () => {
            prisma.node.update = vi.fn().mockRejectedValue(new Error());

            const nodeId = 1;
            const userId = 123;

            await expect(
                nodesService.linkNodeToUser(nodeId, userId)
            ).rejects.toThrow();
            expect(prisma.node.update).toHaveBeenCalled();
        });
    });

    describe('findNodeById()', () => {
        it('should return the node when found by ID', async () => {
            const nodeId = 1;
            const foundNode: Node = {
                id: nodeId,
                userId: 123,
                status: NodeStatus.ACTIVE,
                lastStatusUpdate: new Date(),
            };

            prisma.node.findUnique = vi.fn().mockResolvedValue(foundNode);

            const result = await nodesService.findNodeById(nodeId);

            expect(result).toStrictEqual(foundNode);
            expect(prisma.node.findUnique).toHaveBeenCalledWith({
                where: { id: nodeId },
            });
        });

        it('should return null if no node is found by ID', async () => {
            const nodeId = 1;

            prisma.node.findUnique = vi.fn().mockResolvedValue(null);

            const result = await nodesService.findNodeById(nodeId);

            expect(result).toBeNull();
            expect(prisma.node.findUnique).toHaveBeenCalledWith({
                where: { id: nodeId },
            });
        });

        it('should throw an error if the database call fails', async () => {
            prisma.node.findUnique = vi.fn().mockRejectedValue(new Error());

            const nodeId = 1;

            await expect(nodesService.findNodeById(nodeId)).rejects.toThrow();
            expect(prisma.node.findUnique).toHaveBeenCalled();
        });
    });

    describe('checkIfNodeIsActive()', () => {
        it('should return true if the node is linked to an active user', async () => {
            const nodeId = 1;
            const activeNode: Node = {
                id: nodeId,
                userId: 123,
                status: NodeStatus.ACTIVE,
                lastStatusUpdate: new Date(),
            };

            prisma.node.findFirst = vi.fn().mockResolvedValue(activeNode);

            const result = await nodesService.checkIfNodeIsActive(nodeId);

            expect(result).toBe(true);
            expect(prisma.node.findFirst).toHaveBeenCalledWith({
                where: { id: nodeId, NOT: { status: NodeStatus.UNLINKED } },
            });
        });

        it('should return false if the node is not linked to an active user', async () => {
            const nodeId = 1;

            prisma.node.findFirst = vi.fn().mockResolvedValue(null);

            const result = await nodesService.checkIfNodeIsActive(nodeId);

            expect(result).toBe(false);
            expect(prisma.node.findFirst).toHaveBeenCalledWith({
                where: { id: nodeId, NOT: { status: NodeStatus.UNLINKED } },
            });
        });

        it("should throw an error if checking the node's active status fails", async () => {
            const nodeId = 1;

            prisma.node.findFirst = vi.fn().mockRejectedValue(new Error());

            await expect(
                nodesService.checkIfNodeIsActive(nodeId)
            ).rejects.toThrow();
            expect(prisma.node.findFirst).toHaveBeenCalled();
        });
    });
});
