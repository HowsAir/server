/**
 * @file cloudinaryService.test.ts
 * @brief Unit tests for the Cloudinary service.
 * @author Juan Diaz
 */

import { expect, describe, it, vi, beforeEach } from 'vitest'; // Import Vitest functions for testing and mocking
import {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
} from '../../src/services/cloudinaryService'; // Import the cloudinaryService methods to be tested
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK to mock
import { CloudinaryFolders } from '../../src/types/users/CloudinaryFolders';

// Mock Cloudinary SDK to avoid real uploads and deletions
vi.mock('cloudinary');

describe('cloudinaryService', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Reset all mocks before each test
    });

    describe('uploadImageToCloudinary()', () => {
        it('should upload an image and return its URL', async () => {
            const mockFile = {
                buffer: Buffer.from('fake image data'),
                mimetype: 'image/png',
            } as Express.Multer.File;

            const mockUrl = 'https://cloudinary.com/fake_image_url.png';

            // Mock cloudinary.uploader.upload to simulate a successful upload
            cloudinary.uploader.upload = vi
                .fn()
                .mockResolvedValue({ url: mockUrl });

            // Call the function to test
            const result = await uploadImageToCloudinary(
                mockFile,
                CloudinaryFolders.PROFILE_PHOTOS
            );

            // Assert the URL returned matches the mock
            expect(result).toBe(mockUrl);
            expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
                `data:image/png;base64,${Buffer.from(mockFile.buffer).toString('base64')}`,
                { folder: CloudinaryFolders.PROFILE_PHOTOS }
            );
        });

        it('should throw an error if the upload fails', async () => {
            const mockFile = {
                buffer: Buffer.from('fake image data'),
                mimetype: 'image/png',
            } as Express.Multer.File;

            // Mock cloudinary.uploader.upload to simulate a failed upload
            cloudinary.uploader.upload = vi
                .fn()
                .mockRejectedValue(new Error('Upload failed'));

            // Call the function and assert an error is thrown
            await expect(
                uploadImageToCloudinary(
                    mockFile,
                    CloudinaryFolders.PROFILE_PHOTOS
                )
            ).rejects.toThrow('Upload failed');
            expect(cloudinary.uploader.upload).toHaveBeenCalled();
        });
    });

    describe('deleteImageFromCloudinary()', () => {
        it('should delete an image successfully', async () => {
            const imageUrl =
                'https://res.cloudinary.com/demo/profile_photos/test_image.jpg';

            // Mock cloudinary.uploader.destroy to simulate successful deletion
            cloudinary.uploader.destroy = vi
                .fn()
                .mockResolvedValue({ result: 'ok' });

            // Call the function to test
            await deleteImageFromCloudinary(
                imageUrl,
                CloudinaryFolders.PROFILE_PHOTOS
            );

            // Extract the public_id and assert it was used in the delete call
            const publicId = 'profile_photos/test_image';
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
        });

        it('should throw an error if the image URL format is incorrect', async () => {
            const invalidUrl = 'https://invalid_url.com/test_image.jpg';

            // Call the function and assert an error is thrown due to incorrect URL
            await expect(
                deleteImageFromCloudinary(
                    invalidUrl,
                    CloudinaryFolders.PROFILE_PHOTOS
                )
            ).rejects.toThrow('Could not extract public_id from image URL');
            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
        });

        it('should throw an error if deletion fails on Cloudinary', async () => {
            const imageUrl =
                'https://res.cloudinary.com/demo/profile_photos/test_image.jpg';

            // Mock cloudinary.uploader.destroy to simulate a failed deletion
            cloudinary.uploader.destroy = vi
                .fn()
                .mockRejectedValue(new Error('Deletion failed'));

            // Call the function and assert an error is thrown
            await expect(
                deleteImageFromCloudinary(
                    imageUrl,
                    CloudinaryFolders.PROFILE_PHOTOS
                )
            ).rejects.toThrow('Deletion failed');
            expect(cloudinary.uploader.destroy).toHaveBeenCalled();
        });
    });
});
