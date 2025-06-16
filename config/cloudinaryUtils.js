const { cloudinary } = require('../config/cloudinary');

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result;
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @returns {Promise<Object>} - Cloudinary delete response
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting image: ${error.message}`);
  }
};

/**
 * Update an image in Cloudinary
 * @param {string} publicId - The public ID of the image to update
 * @param {string} newImagePath - Path to the new image file
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const updateImage = async (publicId, newImagePath) => {
  try {
    // First delete the old image
    await deleteImage(publicId);
    // Then upload the new image
    const result = await uploadImage(newImagePath);
    return result;
  } catch (error) {
    throw new Error(`Error updating image: ${error.message}`);
  }
};

/**
 * Get image details from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @returns {Promise<Object>} - Cloudinary image details
 */
const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error getting image details: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
  getImageDetails
};