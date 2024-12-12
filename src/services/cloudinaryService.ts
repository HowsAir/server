/**
 * @file cloudinaryService.ts
 * @brief Service for handling image uploads to Cloudinary.
 * @author Juan Diaz & Manuel Borregales
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryFolders } from '../types/users/CloudinaryFolders';
import { frequencyInMinutes } from '../cron/jobs/airQualityMapJob';

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

/**
 * Uploads an HTML map file to Cloudinary as "latest" and archives the previous "latest" map by renaming it to a timestamp.
 *
 * string: htmlContent -> uploadMapToCloudinary() -> Promise<string>
 *
 * @param htmlContent - The HTML content of the map to upload.
 * @param folder - The Cloudinary folder to store the map, as defined in the CloudinaryFolders enum.
 * @returns {Promise<string>} - A promise that resolves with the URL of the newly uploaded map.
 * @throws {Error} - Throws an error if the upload or archival process fails.
 */
export const uploadMapToCloudinary = async (
    htmlContent: string,
    folder: CloudinaryFolders
): Promise<string> => {
    const timestamp = new Date(Date.now())
        .toISOString()
        .replace(/:\d{2}\.\d{3}Z$/, '') // Deletes th eseconds and milliseconds from the timestamp
        .replace(/:/g, '-'); // replaces the colons with dashes for Cloudinary naming compatibility

    const publicId = `${timestamp}.html`;

    // Convert the HTML content into a Base64-encoded string
    const base64Html = Buffer.from(htmlContent, 'utf-8').toString('base64');

    // Create a data URI with the base64-encoded HTML
    const dataURI = `data:text/html;base64,${base64Html}`;

    // Upload the Base64-encoded HTML content to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'raw', // Specify that this is raw content
        public_id: publicId, // Set the public ID to "latest" for easy identification
        overwrite: true, // Overwrite the existing "latest" map
        invalidate: true, // Invalidate the CDN cache to ensure the latest version is served
    });

    return result.url; // Return the URL of the newly uploaded content
};

export default {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    uploadMapToCloudinary,
};
