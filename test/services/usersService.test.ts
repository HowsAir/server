/**
 * @file usersService.test.ts
 * @brief Unit tests for the users service
 * @author Juan Diaz
 */

import { expect, describe, it, vi } from 'vitest'; // Import Vitest functions for testing and mocking
import { usersService } from '../../src/services/usersService'; // Import the usersService to be tested
import prisma from '../../src/libs/__mocks__/prisma'; // Import the Prisma mock
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

// Mock the prisma and bcrypt libraries using Vitest's mock functions
vi.mock('../../src/libs/prisma'); // Mock Prisma to avoid database calls
vi.mock('bcryptjs'); // Mock bcrypt to avoid actual password hashing

describe('usersService', () => {
    describe('register()', () => {
        it('should create a new user and return it', async () => {
            const user = {
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'hashed_password',
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            // Mock bcrypt.hash to simulate password hashing
            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock the database call to simulate user creation
            prisma.user.create.mockResolvedValue({
                ...user,
                password: hashedPassword,
                id: 1,
                roleId: 1
            });

            // Call the register function
            const createdUser = await usersService.register(user);

            // Assert that the user is returned with the expected data
            expect(createdUser).toStrictEqual({
                ...user,
                password: hashedPassword,
                id: 1,
                roleId: 1,
            });
            expect(bcrypt.hash).toHaveBeenCalled();
        });

        it('should throw an error when user creation fails', async () => {
            const user = {
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'hashed_password',
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            // Mock bcrypt.hash to simulate password hashing
            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock the database call to simulate a failure in user creation
            prisma.user.create.mockRejectedValue(
                new Error('User creation failed')
            );

            // Call the register function and assert that it throws an error
            await expect(usersService.register(user)).rejects.toThrow(
                'User creation failed'
            );
        });
    });

    describe('findUserByEmail()', () => {
        it('should return the user when found', async () => {
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

            // Mock the database call to return the mockUser
            prisma.user.findUnique.mockResolvedValue(user);

            // Test inputs
            const email = 'user@prisma.io';

            // Call the findUserByEmail function
            const createdUser = await usersService.findUserByEmail(email);

            // Assert that the user is returned with the expected data
            expect(createdUser).toStrictEqual(user);
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
