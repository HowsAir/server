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
                phone: '1234567890',
                country: 'Country',
                city: 'City',
                zipCode: '12345',
                address: 'Some Street, 123',
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
                phone: userData.phone,
                country: userData.country,
                city: userData.city,
                zipCode: userData.zipCode,
                address: userData.address,
            };

            // Mock bcrypt.hash to simulate password hashing
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            // Mock Prisma user creation to return the created user
            prisma.user.create = vi.fn().mockResolvedValue(createdUser);

            // Call the register function
            const result = await usersService.register(userData);

            // Assert that the user is created with the expected data
            expect(result).toStrictEqual(createdUser);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    ...userData,
                    password: hashedPassword,
                    roleId: 1,
                    photoUrl: null,
                },
            });
        });

        it('should throw an error when user creation fails', async () => {
            const userData = {
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'plaintext_password',
                phone: '1234567890',
                country: 'Country',
                city: 'City',
                zipCode: '12345',
                address: 'Some Street, 123',
            };

            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            prisma.user.create = vi.fn().mockRejectedValue(new Error());

            await expect(usersService.register(userData)).rejects.toThrow();

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

    describe('updateProfile()', () => {
        it('should update user name and surnames', async () => {
            const updatedUser: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'New Name',
                surnames: 'New Surnames',
                password: 'hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            prisma.user.update = vi.fn().mockResolvedValue(updatedUser);

            const userId = 1;
            const data = { name: 'New Name', surnames: 'New Surnames' };

            const result = await usersService.updateProfile(userId, data);

            expect(result).toStrictEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: data.name,
                    surnames: data.surnames,
                },
            });
        });

        it('should update only the user name if surnames is not provided', async () => {
            const updatedUser: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'Updated Name',
                surnames: 'Existing Surnames',
                password: 'hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            prisma.user.update = vi.fn().mockResolvedValue(updatedUser);

            const userId = 1;
            const data = { name: 'Updated Name' };

            const result = await usersService.updateProfile(userId, data);

            expect(result).toStrictEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { name: data.name },
            });
        });

        it('should throw an error if user update fails', async () => {
            prisma.user.update = vi.fn().mockRejectedValue(new Error());

            const userId = 1;
            const data = { name: 'New Name' };

            await expect(
                usersService.updateProfile(userId, data)
            ).rejects.toThrow();
            expect(prisma.user.update).toHaveBeenCalled();
        });
    });

    describe('changePassword()', () => {
        it('should change the password if current password is correct', async () => {
            const user: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'old_hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            const hashedNewPassword = 'new_hashed_password';

            prisma.user.findUnique = vi.fn().mockResolvedValue(user);
            bcrypt.compare = vi.fn().mockResolvedValue(true);
            bcrypt.hash = vi.fn().mockResolvedValue(hashedNewPassword);
            prisma.user.update = vi.fn().mockResolvedValue(user);

            const result = await usersService.changePassword(
                1,
                'old_password',
                'new_password'
            );

            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'old_password',
                user.password
            );
            expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { password: hashedNewPassword },
            });
        });

        it('should return false if current password is incorrect', async () => {
            const user: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'old_hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            prisma.user.findUnique = vi.fn().mockResolvedValue(user);
            bcrypt.compare = vi.fn().mockResolvedValue(false);

            const result = await usersService.changePassword(
                1,
                'wrong_password',
                'new_password'
            );

            expect(result).toBe(false);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'wrong_password',
                user.password
            );
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('should return false if user is not found', async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const result = await usersService.changePassword(
                999,
                'old_password',
                'new_password'
            );

            expect(result).toBe(false);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('should throw an error if password change fails', async () => {
            const user: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'old_hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            prisma.user.findUnique = vi.fn().mockResolvedValue(user);
            bcrypt.compare = vi.fn().mockResolvedValue(true);
            bcrypt.hash = vi.fn().mockResolvedValue('new_hashed_password');
            prisma.user.update = vi.fn().mockRejectedValue(new Error());

            await expect(
                usersService.changePassword(1, 'old_password', 'new_password')
            ).rejects.toThrow();
            expect(prisma.user.update).toHaveBeenCalled();
        });
    });
});
