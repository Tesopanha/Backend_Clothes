const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clothes-api', // The name of the folder in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Allowed formats
    transformation: [
        {
            quality: 'auto',
            fetch_format: 'auto',
        },
        { 
            width: 1200, 
            height: 1200, 
            crop: 'fill',
            gravity: 'auto',
        }] // Optional image transformation
  }
});
const brandstorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clothes-api', // The name of the folder in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Allowed formats
    transformation: [
        {
            quality: 'auto',
            fetch_format: 'auto',
        },
        { 
            width: 800, 
            height: 800, 
            crop: 'fill',
            gravity: 'auto',
        }] // Optional image transformation
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });
const uploadBrand = multer({storage: brandstorage});

module.exports = {
  cloudinary,
  upload,
  uploadBrand
}; 