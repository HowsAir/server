/**
 * @file usersService.test.ts
 * @brief Unit tests for the users service
 * @author Juan Diaz
 */

import { expect, describe, it, vi } from 'vitest'; // Import Vitest functions for testing and mocking
import { usersService } from '../../src/services/usersService'; // Import the usersService to be tested
import prisma from '../../src/libs/__mocks__/prisma'; // Import the Prisma mock
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import { UserRole } from '@prisma/client'; // Import user roles from Prisma

// Mock the prisma and bcrypt libraries using Vitest's mock functions
vi.mock('../../src/libs/prisma'); // Mock Prisma to avoid database calls
vi.mock('bcryptjs'); // Mock bcrypt to avoid actual password hashing

describe('usersService', () => {
    describe('register()', () => {
        it('should create a new user and return it', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'plaintext_password',
                name: 'New User',
                role: UserRole.BASIC,
            };

            // Mock bcrypt.hash to simulate password hashing
            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock the database call to simulate user creation
            prisma.user.create.mockResolvedValue({
                id: 1,
                ...userData,
                password: hashedPassword,
            });

            // Call the register function
            const user = await usersService.register(userData);

            // Assert that the user is returned with the expected data
            expect(user).toStrictEqual({
                id: 1,
                ...userData,
                password: hashedPassword,
            });
            expect(bcrypt.hash).toHaveBeenCalled();
        });

        it('should throw an error when user creation fails', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'plaintext_password',
                name: 'New User',
            };

            // Mock bcrypt.hash to simulate password hashing
            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock the database call to simulate a failure in user creation
            prisma.user.create.mockRejectedValue(
                new Error('User creation failed')
            );

            // Call the register function and assert that it throws an error
            await expect(usersService.register(userData)).rejects.toThrow(
                'User creation failed'
            );
        });
    });

    describe('findUserByEmail()', () => {
        it('should return the user when found', async () => {
            const mockUser = {
                id: 1,
                email: 'user@prisma.io',
                password: 'hashed_password',
                name: 'Prisma Fan',
                role: UserRole.BASIC,
            };

            // Mock the database call to return the mockUser
            prisma.user.findUnique.mockResolvedValue(mockUser);

            // Test inputs
            const email = 'user@prisma.io';

            // Call the findUserByEmail function
            const user = await usersService.findUserByEmail(email);

            // Assert that the user is returned with the expected data
            expect(user).toStrictEqual(mockUser);
        });

        it('should return null when user is not found', async () => {
            // Mock the database call to return null, simulating a non-existent user
            prisma.user.findUnique.mockResolvedValue(null);

            // Test inputs
            const email = 'nonexistent@example.com';

            // Call the findUserByEmail function
            const user = await usersService.findUserByEmail(email);

            // Assert that null is returned when no user is found
            expect(user).toBeNull();
        });

        it('should throw an error when database call fails', async () => {
            // Mock the database call to simulate a failure
            prisma.user.findUnique.mockRejectedValue(
                new Error('Database error')
            );

            // Test inputs
            const email = 'error@example.com';

            // Call the findUserByEmail function and assert that it throws an error
            await expect(usersService.findUserByEmail(email)).rejects.toThrow(
                'Database error'
            );
        });
    });
});
