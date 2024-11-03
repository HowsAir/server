/**
 * @file authMiddleware.test.ts
 * @brief Unit tests for reset password auth middleware functions
 * @author Manuel Borregales
 */
import { expect, describe, it, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyResetPasswordToken } from '../../src/middleware/resetPasswordAuth';

vi.mock('jsonwebtoken'); // Mock jsonwebtoken to avoid actual token verification

// Define tests for the reset password token middleware
describe('verifyResetPasswordToken', () => {
    // Tests for the verifyResetPasswordToken function
    it('should return 401 if no reset password token is present', () => {
        const req = { cookies: {} } as Request;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;
        const next = vi.fn();

        verifyResetPasswordToken(req, res, next);

        // Verify that 401 Unauthorized is returned when no token is present
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 401 if the reset password token is invalid', () => {
        const req = {
            cookies: {
                [process.env.RESET_PASSWORD_TOKEN as string]: 'invalid_token',
            },
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

        // Silence console.error during this test to avoid noisy output
        const originalConsoleError = console.error;
        console.error = vi.fn();

        verifyResetPasswordToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });

        // Restore console.error after the test
        console.error = originalConsoleError;
    });

    it('should extract userId from a valid reset password token', () => {
        const req = {
            cookies: {
                [process.env.RESET_PASSWORD_TOKEN as string]: 'valid_token',
            },
        } as unknown as Request;
        const res = {} as Response;
        const next = vi.fn();

        // Mock jwt.verify to return a valid decoded token
        const decodedToken = { userId: 123 };
        jwt.verify = vi.fn().mockReturnValue(decodedToken);

        verifyResetPasswordToken(req, res, next);

        // Verify that userId is correctly extracted from the token
        expect(req.userId).toBe(123);
        expect(next).toHaveBeenCalled(); // Verify that next is called to continue
    });
});
