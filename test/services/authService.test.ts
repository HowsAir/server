/**
 * @file authService.test.ts
 * @brief Unit tests for the authentication service
 * @author Manuel Borregales
 */

import { expect, describe, it, vi, beforeEach } from 'vitest';
import { authService } from '../../src/services/authService';
import prisma from '../../src/libs/prisma';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { sendPasswordResetEmail } from '../../src/utils/emailService';
import { generateResetCode } from '../../src/utils/auth';

// Mock dependencies
vi.mock('../../src/libs/prisma');
vi.mock('bcryptjs');
vi.mock('../../src/utils/emailService');
vi.mock('../../src/utils/auth');

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('login()', () => {
        it('should return the user when credentials are valid', async () => {
            // Arrange: Create mock user data
            const mockUser: User = {
                id: 1,
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

            // Mock Prisma findUnique to return the mock user
            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);

            // Mock bcrypt compare to return true for valid password
            bcrypt.compare = vi.fn().mockResolvedValue(true);

            // Act: Call the login function
            const result = await authService.login(
                'user@prisma.io',
                'correct_password'
            );

            // Assert: Check the returned user and verify function calls
            expect(result).toStrictEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'user@prisma.io' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'correct_password',
                mockUser.password
            );
        });

        it('should return null when user is not found', async () => {
            // Arrange: Mock Prisma to return null (user not found)
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            // Act: Call the login function with non-existent user
            const result = await authService.login(
                'nonexistent@example.com',
                'any_password'
            );

            // Assert: Check null return and verify function calls
            expect(result).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'nonexistent@example.com' },
            });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return null when password is invalid', async () => {
            // Arrange: Create mock user and setup mocks
            const mockUser: User = {
                id: 1,
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

            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            bcrypt.compare = vi.fn().mockResolvedValue(false);

            // Act: Call the login function with incorrect password
            const result = await authService.login(
                'user@prisma.io',
                'wrong_password'
            );

            // Assert: Check null return and verify function calls
            expect(result).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'user@prisma.io' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'wrong_password',
                mockUser.password
            );
        });

        it('should throw an error when database query fails', async () => {
            // Arrange: Mock Prisma to throw an error
            prisma.user.findUnique = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            // Act & Assert: Verify that the error is thrown
            await expect(
                authService.login('user@prisma.io', 'any_password')
            ).rejects.toThrow();

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'user@prisma.io' },
            });
        });
    });

    describe('initiatePasswordReset()', () => {
        const mockUser: User = {
            id: 1,
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

        it('should create reset token and send email when user exists', async () => {
            // Arrange
            const mockResetCode = '123456';
            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            prisma.passwordResetToken.create = vi.fn().mockResolvedValue({
                id: 1,
                userId: mockUser.id,
                code: mockResetCode,
                timestamp: new Date(),
            });
            generateResetCode.mockReturnValue(mockResetCode);

            // Act
            await authService.initiatePasswordReset(mockUser.email);

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockUser.email },
            });
            expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
                data: {
                    userId: mockUser.id,
                    code: mockResetCode,
                    timestamp: expect.any(Date),
                },
            });
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(
                mockUser.email,
                mockResetCode
            );
        });

        it('should do nothing when user does not exist', async () => {
            // Arrange
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            // Act
            await authService.initiatePasswordReset('nonexistent@example.com');

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'nonexistent@example.com' },
            });
            expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
            expect(sendPasswordResetEmail).not.toHaveBeenCalled();
        });

        it('should throw error when database operations fail', async () => {
            // Arrange
            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            prisma.passwordResetToken.create = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(
                authService.initiatePasswordReset(mockUser.email)
            ).rejects.toThrow('Database error');
        });
    });

    describe('verifyResetCode()', () => {
        const mockUser: User = {
            id: 1,
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

        it('should return user when reset code is valid and not expired', async () => {
            // Arrange
            const validCode = '123456';
            const currentDate = new Date();
            const tokenDate = new Date(currentDate.getTime() - 10 * 60 * 1000); // 10 minutes ago

            const mockResetToken = {
                id: 1,
                userId: mockUser.id,
                code: validCode,
                timestamp: tokenDate,
            };

            const mockUserWithToken = {
                ...mockUser,
                passwordResetTokens: [mockResetToken],
            };

            prisma.user.findUnique = vi
                .fn()
                .mockResolvedValue(mockUserWithToken);

            // Act
            const result = await authService.verifyResetCode(
                mockUser.email,
                validCode
            );

            // Assert
            // Remove passwordResetTokens from the result before comparing
            const { passwordResetTokens: _, ...resultWithoutTokens } =
                result as any;
            expect(resultWithoutTokens).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockUser.email },
                include: {
                    passwordResetTokens: {
                        orderBy: { timestamp: 'desc' },
                        take: 1,
                    },
                },
            });
        });

        it('should return null when reset code is expired', async () => {
            // Arrange
            const validCode = '123456';
            const currentDate = new Date();
            const tokenDate = new Date(currentDate.getTime() - 20 * 60 * 1000); // 20 minutes ago (expired)

            const mockUserWithToken = {
                ...mockUser,
                passwordResetTokens: [
                    {
                        id: 1,
                        userId: mockUser.id,
                        code: validCode,
                        timestamp: tokenDate,
                    },
                ],
            };

            prisma.user.findUnique = vi
                .fn()
                .mockResolvedValue(mockUserWithToken);

            // Act
            const result = await authService.verifyResetCode(
                mockUser.email,
                validCode
            );

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when reset code does not match', async () => {
            // Arrange
            const validCode = '123456';
            const invalidCode = '654321';
            const currentDate = new Date();
            const tokenDate = new Date(currentDate.getTime() - 10 * 60 * 1000);

            const mockUserWithToken = {
                ...mockUser,
                passwordResetTokens: [
                    {
                        id: 1,
                        userId: mockUser.id,
                        code: validCode,
                        timestamp: tokenDate,
                    },
                ],
            };

            prisma.user.findUnique = vi
                .fn()
                .mockResolvedValue(mockUserWithToken);

            // Act
            const result = await authService.verifyResetCode(
                mockUser.email,
                invalidCode
            );

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when user has no reset tokens', async () => {
            // Arrange
            const mockUserWithoutTokens = {
                ...mockUser,
                passwordResetTokens: [],
            };

            prisma.user.findUnique = vi
                .fn()
                .mockResolvedValue(mockUserWithoutTokens);

            // Act
            const result = await authService.verifyResetCode(
                mockUser.email,
                '123456'
            );

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when user does not exist', async () => {
            // Arrange
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            // Act
            const result = await authService.verifyResetCode(
                'nonexistent@example.com',
                '123456'
            );

            // Assert
            expect(result).toBeNull();
        });

        it('should throw error when database query fails', async () => {
            // Arrange
            prisma.user.findUnique = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(
                authService.verifyResetCode('user@prisma.io', '123456')
            ).rejects.toThrow('Database error');
        });
    });
});
