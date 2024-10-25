/**
 * @file authMiddleware.test.ts
 * @brief Unit tests for auth middleware functions
 * @author Juan Diaz
 */
import { expect, describe, it, vi } from 'vitest'; // Import Vitest functions for testing and mocking
import { verifyToken, authorizeRoles } from '../../src/middleware/auth'; // Import the middleware to be tested
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token verification
import { Request, Response, NextFunction } from 'express'; // Import types from Express

vi.mock('jsonwebtoken'); // Mock jsonwebtoken to avoid actual token verification

// Define tests for the auth middleware
describe('authMiddleware', () => {
    // Tests for the verifyToken function
    describe('verifyToken()', () => {
        it('should return 401 if no token is present', () => {
            const req = { cookies: {} } as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as unknown as Response;
            const next = vi.fn();

            verifyToken(req, res, next);

            // Verify that 401 Unauthorized is returned when no token is present
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });

        it('should return 401 if the token is invalid', () => {
            const req = {
                cookies: { auth_token: 'invalid_token' },
            } as unknown as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as unknown as Response;
            const next = vi.fn();

            // Mock jwt.verify to throw an error, simulating an invalid token
            jwt.verify = vi.fn().mockImplementation(() => {
                throw new Error('Invalid token');
            });

            verifyToken(req, res, next);

            // Verify that 401 Unauthorized is returned when the token is invalid
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });

        it('should extract userId and role from a valid token', () => {
            const req = {
                cookies: { auth_token: 'valid_token' },
            } as unknown as Request;
            const res = {} as Response;
            const next = vi.fn();

            // Mock jwt.verify to return a valid decoded token
            const decodedToken = { userId: 123, roleId: 1 };
            jwt.verify = vi.fn().mockReturnValue(decodedToken);

            verifyToken(req, res, next);

            // Verify that userId and role are correctly extracted from the token
            expect(req.userId).toBe(123);
            expect(req.roleId).toBe(1);
            expect(next).toHaveBeenCalled(); // Verify that next is called to continue
        });
    });

    // Tests for the authorizeRoles function
    describe('authorizeRoles()', () => {
        it('should allow access when user role is authorized', () => {
            const req = { roleId: 1 } as unknown as Request; // Simulate a user with 'admin' role
            const res = {} as Response;
            const next = vi.fn();

            const middleware = authorizeRoles(1, 2, 3);
            middleware(req, res, next);

            // Verify that next() is called, allowing access
            expect(next).toHaveBeenCalled();
        });

        it('should return 403 if user role is not authorized', () => {
            const req = { role: 3 } as unknown as Request; // Simulate a user with 'user' role
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as unknown as Response;
            const next = vi.fn();

            const middleware = authorizeRoles(1, 2);
            middleware(req, res, next);

            // Verify that 403 Forbidden is returned when role is not allowed
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
        });
    });
});
