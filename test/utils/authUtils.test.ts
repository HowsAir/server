/**
 * @file auth.test.ts
 * @brief Unit tests for the authentication utility functions
 * @author Juan Diaz & Manuel Borregales
 */

import { describe, it, expect, vi } from 'vitest'; // Import Vitest functions for testing and mocking
import { putJwtInResponse, generateResetCode } from '../../src/utils/authUtils'; // Import the functions to test
import { auth_token, password_reset_token } from '../../src/middleware/auth'; // Import the cookie names for the tests
import jwt from 'jsonwebtoken'; // Mocked jwt library
import { Response } from 'express';
import {} from 'dotenv'; // Import the Express Response object for type checks

vi.mock('jsonwebtoken'); // Mock the jsonwebtoken library to avoid actual token creation

describe('auth utility functions', () => {
    describe('putJwtInResponse()', () => {
        it('should generate a valid JWT token and set it as a cookie', () => {
            // Arrange: Mock response object and user data
            const res = {
                cookie: vi.fn(),
            } as unknown as Response;

            const user = {
                id: 123,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            // Mock jwt.sign to return a fake token
            const fakeToken = 'fake_jwt_token';
            jwt.sign = vi.fn().mockReturnValue(fakeToken);

            // Act: Call the function
            putJwtInResponse(res, user, auth_token);

            // Assert: Check if jwt.sign was called with the correct payload
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: user.id, roleId: user.roleId },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '21600m' }
            );

            // Assert: Check if the token was added to the response as a cookie with correct settings
            expect(res.cookie).toHaveBeenCalledWith(
                auth_token, // Cookie name
                fakeToken, // JWT token
                {
                    httpOnly: true, // Security flag
                    secure: process.env.NODE_ENV === 'production', // Secure flag depends on environment
                    maxAge: 15 * 24 * 60 * 60 * 1000, // Expiration in milliseconds (2 days)
                }
            );
        });

        it('should use secure flag only in production environment', () => {
            // Arrange: Set environment to production
            process.env.NODE_ENV = 'production';

            const res = {
                cookie: vi.fn(),
            } as unknown as Response;

            const user = {
                id: 123,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            const fakeToken = 'fake_jwt_token';
            jwt.sign = vi.fn().mockReturnValue(fakeToken);

            // Act: Call the function
            putJwtInResponse(res, user, auth_token);

            // Assert: Check if secure flag is set to true in production
            expect(res.cookie).toHaveBeenCalledWith(
                auth_token,
                fakeToken,
                expect.objectContaining({ secure: true })
            );
        });

        it('should use non-secure flag in non-production environments', () => {
            // Arrange: Set environment to development
            process.env.NODE_ENV = 'development';

            const res = {
                cookie: vi.fn(),
            } as unknown as Response;

            const user = {
                id: 123,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            const fakeToken = 'fake_jwt_token';
            jwt.sign = vi.fn().mockReturnValue(fakeToken);

            // Act: Call the function
            putJwtInResponse(res, user, auth_token);

            // Assert: Check if secure flag is set to false in non-production
            expect(res.cookie).toHaveBeenCalledWith(
                auth_token,
                fakeToken,
                expect.objectContaining({ secure: false })
            );
        });
    });

    describe('generateResetCode()', () => {
        it('should generate a string of exactly 6 digits', () => {
            const code = generateResetCode();

            expect(typeof code).toBe('string');
            expect(code).toMatch(/^\d{6}$/);
        });

        it('should generate different codes on subsequent calls', () => {
            const code1 = generateResetCode();
            const code2 = generateResetCode();

            expect(code1).not.toBe(code2);
        });

        it('should never generate a code less than 100000', () => {
            // Test multiple times to increase confidence
            for (let i = 0; i < 1000; i++) {
                const code = parseInt(generateResetCode());
                expect(code).toBeGreaterThanOrEqual(100000);
            }
        });

        it('should never generate a code greater than 999999', () => {
            // Test multiple times to increase confidence
            for (let i = 0; i < 1000; i++) {
                const code = parseInt(generateResetCode());
                expect(code).toBeLessThanOrEqual(999999);
            }
        });

        it('should pad numbers with leading zeros when necessary', () => {
            // Mock Math.random to return a value that would generate a number less than 100000
            const originalRandom = Math.random;
            Math.random = vi.fn().mockReturnValue(0); // This will generate 100000

            const code = generateResetCode();
            expect(code).toBe('100000');

            // Restore original Math.random
            Math.random = originalRandom;
        });
    });
});
