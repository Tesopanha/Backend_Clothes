const mongoose = require('mongoose');
const Product = require('../models/Product'); // Import the Product model
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to MongoDB for product variants migration'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function up() {
    try {
        // Define a default image URL and Cloudinary ID if needed
        // You can use a generic placeholder or keep it null if no default is desired
        const defaultImageUrl = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default-product-variant';
        const defaultCloudinaryId = 'default-product-variant';

        // Update all product variants to add cloudinaryId and ensure imageURL is present
        const result = await Product.updateMany(
            { "variants.cloudinaryId": { $exists: false } }, // Find variants missing cloudinaryId
            { $set: { "variants.$[elem].cloudinaryId": defaultCloudinaryId } }, // Set default cloudinaryId
            { arrayFilters: [{ "elem.cloudinaryId": { $exists: false } }] }
        );
        console.log(`Updated ${result.modifiedCount} product variants with default cloudinaryId`);

        // Also, ensure imageURL is present for older variants if needed (if it was ever removed or not set)
        const resultImageURL = await Product.updateMany(
            { "variants.imageURL": { $exists: false } }, // Find variants missing imageURL
            { $set: { "variants.$[elem].imageURL": defaultImageUrl } }, // Set default imageURL
            { arrayFilters: [{ "elem.imageURL": { $exists: false } }] }
        );
        console.log(`Updated ${resultImageURL.modifiedCount} product variants with default imageURL`);

    } catch (error) {
        console.error('Product variants migration failed:', error);
        throw error;
    }
}

async function down() {
    try {
        // In a rollback, you might want to remove these fields or revert to previous state
        // For simplicity, this rollback removes the fields.
        const result = await Product.updateMany(
            {},
            { $unset: { "variants.$[].imageURL": "", "variants.$[].cloudinaryId": "" } }
        );
        console.log(`Removed imageURL and cloudinaryId from ${result.modifiedCount} product variants`);
    } catch (error) {
        console.error('Product variants rollback failed:', error);
        throw error;
    }
}

// Run the migration
up()
    .then(() => {
        console.log('Product variants migration completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Product variants migration failed:', error);
        process.exit(1);
    }); 