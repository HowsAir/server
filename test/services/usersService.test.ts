/**
 * @file usersService.test.ts
 * @brief Unit tests for the users service
 * @author Juan Diaz & Manuel Borregales
 */

import { expect, describe, it, vi, beforeEach } from 'vitest'; // Import Vitest functions for testing and mocking
import { usersService } from '../../src/services/usersService'; // Import the usersService to be tested
import prisma from '../../src/libs/prisma'; // Import the Prisma mock
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import { User } from '@prisma/client'; // Import User type
import cloudinaryService from '../../src/services/cloudinaryService'; // Import the Cloudinary service mock
import { UserRoleId } from '../../src/types/UserRoleId';
import { CloudinaryFolders } from '../../src/types/CloudinaryFolders';
import { PasswordResetStatus } from '../../src/types/PasswordResetStatus';

// Mock the prisma and bcrypt libraries using Vitest's mock functions
vi.mock('../../src/libs/prisma'); // Mock Prisma to avoid database calls
vi.mock('bcryptjs'); // Mock bcrypt to avoid actual password hashing
vi.mock('../../src/services/cloudinaryService');

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

    describe('registerAdmin()', () => {
        it('should create a new admin and return it', async () => {
            const adminData = {
                email: 'admin@prisma.io',
                name: 'Admin User',
                surnames: 'Admin',
                password: 'plaintext_password',
            };

            const hashedPassword = 'hashed_password';
            const createdAdmin: User = {
                id: 1,
                email: adminData.email,
                name: adminData.name,
                surnames: adminData.surnames,
                password: hashedPassword,
                roleId: UserRoleId.Admin,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            prisma.user.create = vi.fn().mockResolvedValue(createdAdmin);

            const result = await usersService.registerAdmin(adminData);

            expect(result).toStrictEqual(createdAdmin);
            expect(bcrypt.hash).toHaveBeenCalledWith(adminData.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    ...adminData,
                    password: hashedPassword,
                    roleId: UserRoleId.Admin,
                    photoUrl: null,
                },
            });
        });

        it('should throw an error when admin creation fails', async () => {
            const adminData = {
                email: 'admin@prisma.io',
                name: 'Admin User',
                surnames: 'Admin',
                password: 'plaintext_password',
            };

            const hashedPassword = 'hashed_password';
            bcrypt.hash = vi.fn().mockResolvedValue(hashedPassword);

            prisma.user.create = vi.fn().mockRejectedValue(new Error());

            await expect(
                usersService.registerAdmin(adminData)
            ).rejects.toThrow();

            expect(bcrypt.hash).toHaveBeenCalled();
            expect(prisma.user.create).toHaveBeenCalled();
        });
    });

    describe('getUserById()', () => {
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

            const userId = 123;

            const result = await usersService.getUserById(userId);

            expect(result).toStrictEqual(foundUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it('should return null when user is not found', async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const userId = 999;

            const result = await usersService.getUserById(userId);

            expect(result).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it('should throw an error when database call fails', async () => {
            prisma.user.findUnique = vi.fn().mockRejectedValue(new Error());

            const userId = 123;

            await expect(usersService.getUserById(userId)).rejects.toThrow();
            expect(prisma.user.findUnique).toHaveBeenCalled();
        });
    });

    describe('getUserByEmail()', () => {
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

            const result = await usersService.getUserByEmail(email);

            expect(result).toStrictEqual(foundUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
        });

        it('should return null when user is not found', async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const email = 'nonexistent@example.com';

            const result = await usersService.getUserByEmail(email);

            expect(result).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
        });

        it('should throw an error when database call fails', async () => {
            prisma.user.findUnique = vi.fn().mockRejectedValue(new Error());

            const email = 'error@example.com';

            await expect(usersService.getUserByEmail(email)).rejects.toThrow();
            expect(prisma.user.findUnique).toHaveBeenCalled();
        });
    });

describe('updateProfile()', () => {
    it('should update user name, surnames, and upload a new profile photo', async () => {
        const mockUser: User = {
            id: 1,
            email: 'user@prisma.io',
            name: 'Prisma Fan',
            surnames: 'Prisma',
            password: 'hashed_password',
            roleId: 1,
            photoUrl: 'https://cloudinary.com/old_photo_url',
            phone: null,
            country: null,
            city: null,
            zipCode: null,
            address: null,
        };

        const newPhotoUrl = 'https://cloudinary.com/new_photo_url';
        const mockPhoto = {
            buffer: Buffer.from('fake image data'),
            mimetype: 'image/png',
        } as Express.Multer.File;

        prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
        cloudinaryService.uploadImageToCloudinary = vi
            .fn()
            .mockResolvedValue(newPhotoUrl);
        prisma.user.update = vi.fn().mockResolvedValue({
            ...mockUser,
            name: 'New Name',
            surnames: 'New Surnames',
            photoUrl: newPhotoUrl,
        });
        cloudinaryService.deleteImageFromCloudinary = vi
            .fn()
            .mockResolvedValue(undefined);

        const result = await usersService.updateProfile(mockUser.id, {
            name: 'New Name',
            surnames: 'New Surnames',
            photo: mockPhoto,
        });

        expect(result).toStrictEqual({
            ...mockUser,
            name: 'New Name',
            surnames: 'New Surnames',
            photoUrl: newPhotoUrl,
        });
        expect(cloudinaryService.uploadImageToCloudinary).toHaveBeenCalledWith(
            mockPhoto,
            CloudinaryFolders.PROFILE_PHOTOS
        );
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: mockUser.id },
            data: {
                name: 'New Name',
                surnames: 'New Surnames',
                photoUrl: newPhotoUrl,
            },
        });
        expect(
            cloudinaryService.deleteImageFromCloudinary
        ).toHaveBeenCalledWith(
            mockUser.photoUrl,
            CloudinaryFolders.PROFILE_PHOTOS
        );
    });

    it('should update only the user name and surnames without updating the photo if photo is not provided', async () => {
        const mockUser: User = {
            id: 1,
            email: 'user@prisma.io',
            name: 'Original Name',
            surnames: 'Original Surnames',
            password: 'hashed_password',
            roleId: 1,
            photoUrl: 'https://cloudinary.com/photo_url',
            phone: null,
            country: null,
            city: null,
            zipCode: null,
            address: null,
        };

        prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
        prisma.user.update = vi.fn().mockResolvedValue({
            ...mockUser,
            name: 'Updated Name',
            surnames: 'Updated Surnames',
        });

        const result = await usersService.updateProfile(mockUser.id, {
            name: 'Updated Name',
            surnames: 'Updated Surnames',
        });

        expect(result).toStrictEqual({
            ...mockUser,
            name: 'Updated Name',
            surnames: 'Updated Surnames',
        });
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: mockUser.id },
            data: { name: 'Updated Name', surnames: 'Updated Surnames' },
        });
        expect(
            cloudinaryService.uploadImageToCloudinary
        ).not.toHaveBeenCalled();
        expect(
            cloudinaryService.deleteImageFromCloudinary
        ).not.toHaveBeenCalled();
    });

    it('should return null if the user is not found', async () => {
        prisma.user.findUnique = vi.fn().mockResolvedValue(null);

        const result = await usersService.updateProfile(999, {
            name: 'New Name',
        });

        expect(result).toBeNull();
        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(
            cloudinaryService.uploadImageToCloudinary
        ).not.toHaveBeenCalled();
        expect(
            cloudinaryService.deleteImageFromCloudinary
        ).not.toHaveBeenCalled();
    });

    it('should throw an error if photo upload fails', async () => {
        const mockUser: User = {
            id: 1,
            email: 'user@prisma.io',
            name: 'User Name',
            surnames: 'User Surname',
            password: 'hashed_password',
            roleId: 1,
            photoUrl: 'https://cloudinary.com/photo_url',
            phone: null,
            country: null,
            city: null,
            zipCode: null,
            address: null,
        };

        const mockPhoto = {
            buffer: Buffer.from('fake image data'),
            mimetype: 'image/png',
        } as Express.Multer.File;

        prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
        cloudinaryService.uploadImageToCloudinary = vi
            .fn()
            .mockRejectedValue(new Error('Upload failed'));

        await expect(
            usersService.updateProfile(mockUser.id, { photo: mockPhoto })
        ).rejects.toThrow('Upload failed');
        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(
            cloudinaryService.deleteImageFromCloudinary
        ).not.toHaveBeenCalled();
    });

    it('should log an error if deleting the old photo fails, but still update the user', async () => {
        const mockUser: User = {
            id: 1,
            email: 'user@prisma.io',
            name: 'Prisma Fan',
            surnames: 'Prisma',
            password: 'hashed_password',
            roleId: 1,
            photoUrl: 'https://cloudinary.com/old_photo_url',
            phone: null,
            country: null,
            city: null,
            zipCode: null,
            address: null,
        };

        const newPhotoUrl = 'https://cloudinary.com/new_photo_url';
        const mockPhoto = {
            buffer: Buffer.from('fake image data'),
            mimetype: 'image/png',
        } as Express.Multer.File;

        prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
        cloudinaryService.uploadImageToCloudinary = vi
            .fn()
            .mockResolvedValue(newPhotoUrl);
        prisma.user.update = vi.fn().mockResolvedValue({
            ...mockUser,
            photoUrl: newPhotoUrl,
        });
        cloudinaryService.deleteImageFromCloudinary = vi
            .fn()
            .mockRejectedValue(new Error('Deletion failed'));

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const result = await usersService.updateProfile(mockUser.id, {
            photo: mockPhoto,
        });

        expect(result).toStrictEqual({
            ...mockUser,
            photoUrl: newPhotoUrl,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to delete previous user profile photo from Cloudinary: ',
            expect.any(Error)
        );
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: mockUser.id },
            data: { photoUrl: newPhotoUrl },
        });

        consoleErrorSpy.mockRestore();
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

    describe('resetPassword()', () => {
        it('should successfully reset the password when user exists and new password is different', async () => {
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
            bcrypt.compare = vi.fn().mockResolvedValue(false); // New password is different
            bcrypt.hash = vi.fn().mockResolvedValue(hashedNewPassword);
            prisma.user.update = vi.fn().mockResolvedValue(user);

            const result = await usersService.resetPassword(1, 'new_password');

            expect(result).toEqual({ status: PasswordResetStatus.SUCCESS });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'new_password',
                user.password
            );
            expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { password: hashedNewPassword },
            });
        });

        it('should return status "match" if new password matches current password', async () => {
            const user: User = {
                id: 1,
                email: 'user@prisma.io',
                name: 'Prisma Fan',
                surnames: 'Prisma',
                password: 'current_hashed_password',
                roleId: 1,
                photoUrl: null,
                phone: null,
                country: null,
                city: null,
                zipCode: null,
                address: null,
            };

            prisma.user.findUnique = vi.fn().mockResolvedValue(user);
            bcrypt.compare = vi.fn().mockResolvedValue(true); // New password matches current

            const result = await usersService.resetPassword(1, 'same_password');

            expect(result).toEqual({ status: PasswordResetStatus.MATCH });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'same_password',
                user.password
            );
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('should return status "fail" if user is not found', async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const result = await usersService.resetPassword(
                999,
                'new_password'
            );

            expect(result).toEqual({ status: PasswordResetStatus.FAIL });
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('should throw an error if password reset fails during update', async () => {
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
            bcrypt.hash = vi.fn().mockResolvedValue('new_hashed_password');
            prisma.user.update = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(
                usersService.resetPassword(1, 'new_password')
            ).rejects.toThrow();
            expect(prisma.user.update).toHaveBeenCalled();
        });
    });

    describe('getStatistics()', () => {
        it('should return users statistics with calculated averages', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John',
                    surnames: 'Doe',
                    phone: '+1234567890',
                    node: {
                        id: 100,
                        measurements: [
                            { timestamp: new Date('2023-10-01T08:30:00Z') },
                        ],
                    },
                    stats: [
                        { activeHours: 2.5, distance: 5.0 },
                        { activeHours: 3.5, distance: 7.0 },
                    ],
                },
                {
                    id: 2,
                    name: 'Jane',
                    surnames: 'Smith',
                    phone: '+0987654321',
                    node: null,
                    stats: [{ activeHours: 4.0, distance: 8.0 }],
                },
            ];

            prisma.user.findMany = vi.fn().mockResolvedValue(mockUsers);

            const result = await usersService.getStatistics();

            expect(result).toStrictEqual([
                {
                    id: 1,
                    name: 'John',
                    surnames: 'Doe',
                    phone: '+1234567890',
                    nodeId: 100,
                    averageDailyActiveHours: 3.0, // (2.5 + 3.5) / 2
                    averageDailyDistance: 6.0, // (5.0 + 7.0) / 2
                    nodeLastConnection: new Date('2023-10-01T08:30:00Z'),
                },
                {
                    id: 2,
                    name: 'Jane',
                    surnames: 'Smith',
                    phone: '+0987654321',
                    nodeId: null,
                    averageDailyActiveHours: 4.0, // 4.0 / 1
                    averageDailyDistance: 8.0, // 8.0 / 1
                    nodeLastConnection: null,
                },
            ]);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: { roleId: UserRoleId.User },
                select: {
                    id: true,
                    name: true,
                    surnames: true,
                    phone: true,
                    node: {
                        select: {
                            id: true,
                            measurements: {
                                select: {
                                    timestamp: true,
                                },
                                orderBy: {
                                    timestamp: 'desc',
                                },
                                take: 1,
                            },
                        },
                    },
                    stats: {
                        select: {
                            activeHours: true,
                            distance: true,
                        },
                    },
                },
            });
        });

        it('should return users with zero averages when they have no stats', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John',
                    surnames: 'Doe',
                    phone: '+1234567890',
                    node: {
                        id: 100,
                        measurements: [],
                    },
                    stats: [],
                },
            ];

            prisma.user.findMany = vi.fn().mockResolvedValue(mockUsers);

            const result = await usersService.getStatistics();

            expect(result).toStrictEqual([
                {
                    id: 1,
                    name: 'John',
                    surnames: 'Doe',
                    phone: '+1234567890',
                    nodeId: 100,
                    averageDailyActiveHours: 0,
                    averageDailyDistance: 0,
                    nodeLastConnection: null,
                },
            ]);
        });

        it('should return empty array when no users are found', async () => {
            prisma.user.findMany = vi.fn().mockResolvedValue([]);

            const result = await usersService.getStatistics();

            expect(result).toEqual([]);
            expect(prisma.user.findMany).toHaveBeenCalled();
        });

        it('should throw an error if database query fails', async () => {
            prisma.user.findMany = vi
                .fn()
                .mockRejectedValue(new Error('Database error'));

            await expect(usersService.getStatistics()).rejects.toThrow();
            expect(prisma.user.findMany).toHaveBeenCalled();
        });
    });
});
