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
import cloudinaryService, {
    CloudinaryFolders,
} from '../../src/services/cloudinaryService'; // Import the Cloudinary service mock

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

            expect(result).toEqual({ status: 'success' });
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

            expect(result).toEqual({ status: 'match' });
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

            expect(result).toEqual({ status: 'fail' });
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

    describe('updateProfilePhoto()', () => {
        it('should upload a new profile photo, update the user, and delete the old photo', async () => {
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

            // Mocks for Prisma and Cloudinary methods
            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            cloudinaryService.uploadImageToCloudinary = vi
                .fn()
                .mockResolvedValue(newPhotoUrl);
            prisma.user.update = vi
                .fn()
                .mockResolvedValue({ ...mockUser, photoUrl: newPhotoUrl });
            cloudinaryService.deleteImageFromCloudinary = vi
                .fn()
                .mockResolvedValue(undefined);

            // Call the function
            const result = await usersService.updateProfilePhoto(
                mockUser.id,
                mockPhoto
            );

            // Assertions
            expect(result).toStrictEqual({
                ...mockUser,
                photoUrl: newPhotoUrl,
            });
            expect(
                cloudinaryService.uploadImageToCloudinary
            ).toHaveBeenCalledWith(mockPhoto, CloudinaryFolders.PROFILE_PHOTOS);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { photoUrl: newPhotoUrl },
            });
            expect(
                cloudinaryService.deleteImageFromCloudinary
            ).toHaveBeenCalledWith(
                mockUser.photoUrl,
                CloudinaryFolders.PROFILE_PHOTOS
            );
        });

        it('should return null if the user is not found', async () => {
            const mockPhoto = {
                buffer: Buffer.from('fake image data'),
                mimetype: 'image/png',
            } as Express.Multer.File;

            prisma.user.findUnique = vi.fn().mockResolvedValue(null);

            const result = await usersService.updateProfilePhoto(
                999,
                mockPhoto
            );

            expect(result).toBeNull();
            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(
                cloudinaryService.uploadImageToCloudinary
            ).not.toHaveBeenCalled();
        });

        it('should throw an error if the photo upload fails', async () => {
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

            const mockPhoto = {
                buffer: Buffer.from('fake image data'),
                mimetype: 'image/png',
            } as Express.Multer.File;

            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            cloudinaryService.uploadImageToCloudinary = vi
                .fn()
                .mockRejectedValue(new Error('Upload failed'));

            await expect(
                usersService.updateProfilePhoto(mockUser.id, mockPhoto)
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

            // Mocks
            prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);
            cloudinaryService.uploadImageToCloudinary = vi
                .fn()
                .mockResolvedValue(newPhotoUrl);
            prisma.user.update = vi
                .fn()
                .mockResolvedValue({ ...mockUser, photoUrl: newPhotoUrl });
            cloudinaryService.deleteImageFromCloudinary = vi
                .fn()
                .mockRejectedValue(new Error('Deletion failed'));

            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            // Call the function
            const result = await usersService.updateProfilePhoto(
                mockUser.id,
                mockPhoto
            );

            // Assertions
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
});
