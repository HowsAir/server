/**
 * @file auth.test.ts
 * @brief Unit tests for the authentication utility functions
 * @author Juan Diaz
 */

import { describe, it, expect, vi } from 'vitest'; // Import Vitest functions for testing and mocking
import { putJwtInResponse } from '../../src/utils/auth'; // Import the function to be tested
import jwt from 'jsonwebtoken'; // Mocked jwt library
import { Response } from 'express'; // Import the Express Response object for type checks

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
            putJwtInResponse(res, user);

            // Assert: Check if jwt.sign was called with the correct payload
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: user.id, role: user.roleId },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '15d' }
            );

            // Assert: Check if the token was added to the response as a cookie with correct settings
            expect(res.cookie).toHaveBeenCalledWith(
                'auth_token', // Cookie name
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
            putJwtInResponse(res, user);

            // Assert: Check if secure flag is set to true in production
            expect(res.cookie).toHaveBeenCalledWith(
                'auth_token',
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
            putJwtInResponse(res, user);

            // Assert: Check if secure flag is set to false in non-production
            expect(res.cookie).toHaveBeenCalledWith(
                'auth_token',
                fakeToken,
                expect.objectContaining({ secure: false })
            );
        });
    });
});
