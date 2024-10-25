/**
 * @file usersService.test.ts
 * @brief Unit tests for the users service
 */

import { expect, describe, it, vi, beforeEach } from 'vitest'; // Import Vitest functions for testing and mocking
import { usersService } from '../../src/services/usersService'; // Import the usersService to be tested
import prisma from '../../src/libs/prisma'; // Import the Prisma mock
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import { User } from '@prisma/client'; // Import User type

// Mock the prisma and bcrypt libraries using Vitest's mock functions
vi.mock('../../src/libs/prisma'); // Mock Prisma to avoid database calls
vi.mock('bcryptjs'); // Mock bcrypt to avoid actual password hashing

describe('usersService', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Reset all mocks before each test
    });

    describe('register()', () => {
        it('should create a new user and return it', async () => {
            const userData = {
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'plaintext_password',
            };

            const hashedPassword = 'hashed_password';
            const createdUser: User = {
                id: 1,
                email: userData.email,
                name: userData.name,
                surnames: userData.surnames,
                password: hashedPassword,
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            // Mock bcrypt.hash to simulate password hashing
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock Prisma user creation to return the created user
            prisma.user.create = vi.fn().mockResolvedValue(createdUser);

            // Call the register function
            const result = await usersService.register(
                userData.email,
                userData.password,
                userData.name,
                userData.surnames
            );

            // Assert that the user is created with the expected data
            expect(result).toStrictEqual(createdUser);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    surnames: userData.surnames,
                    roleId: 1,
                    photoUrl: null,
                    phone: null,
                    country: null,
                    city: null,
                    zipCode: null,
                    address: null,
                },
            });
        });

        it('should throw an error when user creation fails', async () => {
            const userData = {
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'plaintext_password',
            };

            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            prisma.user.create = vi.fn().mockRejectedValue(new Error());

            await expect(
                usersService.register(
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.surnames
                )
            ).rejects.toThrow();

            expect(bcrypt.hash).toHaveBeenCalled();
            expect(prisma.user.create).toHaveBeenCalled();
        });
    });

    describe('findUserByEmail()', () => {
        it('should return the user when found', async () => {
            const foundUser: User = {
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

            prisma.user.findUnique = vi.fn().mockResolvedValue(foundUser);

            const email = 'user@prisma.io';

            const result = await usersService.findUserByEmail(email);

            expect(result).toStrictEqual(foundUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
        });

        it('should return null when user is not found', async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const email = 'nonexistent@example.com';

            const result = await usersService.findUserByEmail(email);

            expect(result).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
        });

        it('should throw an error when database call fails', async () => {
            prisma.user.findUnique = vi.fn().mockRejectedValue(new Error());

            const email = 'error@example.com';

            await expect(usersService.findUserByEmail(email)).rejects.toThrow();
            expect(prisma.user.findUnique).toHaveBeenCalled();
        });
    });
});
