const Brand = require('../models/Brand');
const Color = require('../models/Color');
const Size = require('../models/Size');

// utils/validateIds.js
const validateIds = async (brandId, colorIds, sizeIds) => {
    try {
        // Validate brand
        if (brandId) {
            const brand = await Brand.findById(brandId);
            if (!brand) {
                throw new Error('Invalid brand ID');
            }
        }

        // Filter out null/undefined values and flatten the array
        const validColorIds = colorIds
            .filter(id => id !== null && id !== undefined)
            .flat();

        // Only validate colors if there are any
        if (validColorIds.length > 0) {
            const colors = await Color.find({ 
                _id: { 
                    $in: validColorIds
                } 
            });
            
            // Check if all color IDs are valid
            const foundColorIds = colors.map(color => color._id.toString());
            const invalidColors = validColorIds.filter(id => 
                !foundColorIds.includes(id.toString())
            );
            
            if (invalidColors.length > 0) {
                throw new Error(`Invalid color IDs: ${invalidColors.join(', ')}`);
            }
        }

        // Filter out null/undefined values for sizes
        const validSizeIds = sizeIds
            .filter(id => id !== null && id !== undefined)
            .flat();

        // Only validate sizes if there are any
        if (validSizeIds.length > 0) {
            const sizes = await Size.find({ 
                _id: { 
                    $in: validSizeIds 
                } 
            });
            
            // Check if all size IDs are valid
            const foundSizeIds = sizes.map(size => size._id.toString());
            const invalidSizes = validSizeIds.filter(id => 
                !foundSizeIds.includes(id.toString())
            );
            
            if (invalidSizes.length > 0) {
                throw new Error(`Invalid size IDs: ${invalidSizes.join(', ')}`);
            }
        }

        return true;
    } catch (error) {
        throw new Error(`Validation failed: ${error.message}`);
    }
};

// Helper function to validate a single variant
const validateVariant = async (variant) => {
    try {
        // Validate size
        if (!variant.size) {
            throw new Error('Size is required for variant');
        }

        const size = await Size.findById(variant.size);
        if (!size) {
            throw new Error(`Invalid size ID: ${variant.size}`);
        }

        // Validate colors if provided
        if (variant.colors && Array.isArray(variant.colors)) {
            const colors = await Color.find({
                _id: { $in: variant.colors }
            });

            const foundColorIds = colors.map(color => color._id.toString());
            const invalidColors = variant.colors.filter(id => 
                !foundColorIds.includes(id.toString())
            );

            if (invalidColors.length > 0) {
                throw new Error(`Invalid color IDs: ${invalidColors.join(', ')}`);
            }
        }

        // Validate stock
        if (variant.stock !== undefined && variant.stock < 0) {
            throw new Error('Stock cannot be negative');
        }

        return true;
    } catch (error) {
        throw new Error(`Variant validation failed: ${error.message}`);
    }
};

// Helper function to validate multiple variants
const validateVariants = async (variants) => {
    try {
        if (!Array.isArray(variants)) {
            throw new Error('Variants must be an array');
        }

        // Validate each variant
        for (const variant of variants) {
            await validateVariant(variant);
        }

        // Check for duplicate variants
        const variantKeys = variants.map(v => 
            `${v.size}-${(v.colors || []).sort().join(',')}`
        );
        const uniqueKeys = new Set(variantKeys);
        
        if (variantKeys.length !== uniqueKeys.size) {
            throw new Error('Duplicate variants found (same size and colors combination)');
        }

        return true;
    } catch (error) {
        throw new Error(`Variants validation failed: ${error.message}`);
    }
};

module.exports = {
    validateIds,
    validateVariant,
    validateVariants
};