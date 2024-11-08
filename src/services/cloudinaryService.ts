/**
 * @file cloudinaryService.ts
 * @brief Service for handling image uploads to Cloudinary.
 * @author Juan Diaz
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryFolders } from '../types/CloudinaryFolders';


/**
 * Uploads an image file to Cloudinary and stores it in the specified folder. Returns the URL of the uploaded image.
 *
 * File: file -> uploadImageToCloudinary() -> Promise<string>
 *
 * @param file - An object containing the image file to be uploaded, adhering to Express.Multer.File type.
 * @param folder - The Cloudinary folder to store the image, as defined in the CloudinaryFolders enum.
 * @returns {Promise<string>} - A promise that resolves with the URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload to Cloudinary fails.
 */
export const uploadImageToCloudinary = async (
    file: Express.Multer.File,
    folder: CloudinaryFolders
): Promise<string> => {
    const base64Image = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder,
    });
    return result.url;
};

/**
 * Deletes an image from Cloudinary based on its URL, retrieving the public_id from the specified folder.
 *
 * string: imageUrl -> deleteImageFromCloudinary() -> Promise<void>
 *
 * @param imageUrl - The full URL of the image to delete in Cloudinary.
 * @param folder - The Cloudinary folder containing the image, as defined in the CloudinaryFolders enum.
 * @returns {Promise<void>} - A promise that resolves when the image has been deleted.
 * @throws {Error} - Throws an error if the deletion from Cloudinary fails.
 */
export const deleteImageFromCloudinary = async (
    imageUrl: string,
    folder: CloudinaryFolders
): Promise<void> => {
    const regex = new RegExp(`/${folder}/([^/]+)\\.(jpg|jpeg|png|gif)$`);
    const match = imageUrl.match(regex);

    if (!match) {
        throw new Error('Could not extract public_id from image URL');
    }

    const publicId = `${folder}/${match[1]}`;
    await cloudinary.uploader.destroy(publicId);
};

export default {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
};
