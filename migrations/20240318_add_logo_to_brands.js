const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to MongoDB for brand migration'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function up() {
    try {
        // Add default logo URL and cloudinaryId for existing brands
        const defaultLogoUrl = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default-brand-logo';
        const defaultCloudinaryId = 'default-brand-logo';

        const result = await Brand.updateMany(
            { 
                $or: [
                    { logoURL: { $exists: false } },
                    { cloudinaryId: { $exists: false } }
                ]
            },
            { 
                $set: { 
                    logoURL: defaultLogoUrl,
                    cloudinaryId: defaultCloudinaryId
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} brands with default logo fields`);
    } catch (error) {
        console.error('Brand migration failed:', error);
        throw error;
    }
}

async function down() {
    try {
        // Remove logo fields from all brands
        const result = await Brand.updateMany(
            {},
            { 
                $unset: { 
                    logoURL: "",
                    cloudinaryId: ""
                }
            }
        );

        console.log(`Removed logo fields from ${result.modifiedCount} brands`);
    } catch (error) {
        console.error('Brand rollback failed:', error);
        throw error;
    }
}

// Run the migration
up()
    .then(() => {
        console.log('Brand migration completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Brand migration failed:', error);
        process.exit(1);
    }); 