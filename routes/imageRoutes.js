const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { uploadImage, deleteImage, updateImage, getImageDetails } = require('../utils/cloudinaryUtils');

// Upload a single image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.status(200).json({
      message: 'Image uploaded successfully',
      data: req.file
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an image
router.delete('/:publicId', async (req, res) => {
  try {
    const result = await deleteImage(req.params.publicId);
    res.status(200).json({
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an image
router.put('/:publicId', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const result = await updateImage(req.params.publicId, req.file.path);
    res.status(200).json({
      message: 'Image updated successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get image details
router.get('/:publicId', async (req, res) => {
  try {
    const result = await getImageDetails(req.params.publicId);
    res.status(200).json({
      message: 'Image details retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 