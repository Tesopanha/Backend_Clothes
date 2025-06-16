const asyncHandler = require('../utils/asyncHandler');
const Brand = require('../models/Brand');
const { cloudinary } = require('../config/cloudinary');

// Get all brands
exports.getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find();
    res.json({
        success: true,
        data: brands
    });
});

// Create a new brand
exports.createBrand = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'Brand logo is required',
            error:{
                delail: 'No logo file was upload'
            }
        });
    }
     // Check if brand with same name already exists
     const existingBrand = await Brand.findOne({ name });
     if (existingBrand) {
         return res.status(400).json({
             success: false,
             message: 'Brand already exists',
             error: {
                 detail: 'A brand with this name already exists'
             }
         });
     }

    const brand = new Brand({ 
        name,
        logoURL: req.file.path,
        cloudinaryId: req.file.filename
    });
    
    await brand.save();
    res.status(201).json({
        success: true,
        data: brand,
        message: 'Brand created successfully'
    });
});

// Update a brand
exports.updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    // Find the brand first
    const brand = await Brand.findById(id);
    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Brand not found',
            error: {
                detail: `No brand found with id: ${id}`
            }
        });
    }

    // Check if there are any updates
    if (!name && !req.file) {
        return res.status(400).json({
            success: false,
            message: 'No updates provided',
            error: {
                detail: 'Please provide either a new name or a new logo to update'
            }
        });
    }

    // Handle name update
    if (name) {
        // Check if the new name is different from current name
        if (name !== brand.name) {
            // Check for duplicate brand names
            const existingBrand = await Brand.findOne({ name });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand name already exists',
                    error: {
                        detail: 'A brand with this name already exists'
                    }
                });
            }
            brand.name = name;
        }
    }

    // Handle logo update
    if (req.file) {
        try {
            // Delete old logo from Cloudinary
            if (brand.cloudinaryId) {
                await cloudinary.uploader.destroy(brand.cloudinaryId);
            }

            // Update with new logo
            brand.logoURL = req.file.path;
            brand.cloudinaryId = req.file.filename;
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error updating brand logo',
                error: {
                    detail: error.message
                }
            });
        }
    }

    // Save the updated brand
    await brand.save();

    // Return appropriate message based on what was updated
    let updateMessage = 'Brand updated successfully';
    if (name && req.file) {
        updateMessage = 'Brand name and logo updated successfully';
    } else if (name) {
        updateMessage = 'Brand name updated successfully';
    } else if (req.file) {
        updateMessage = 'Brand logo updated successfully';
    }

    res.json({
        success: true,
        data: brand,
        message: updateMessage
    });
});

// Delete a brand
exports.deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Brand not found',
            error: {
                detail: `No brand found with id: ${id}`
            }
        });
    }

    try {
        // Delete logo from Cloudinary
        if (brand.cloudinaryId) {
            await cloudinary.uploader.destroy(brand.cloudinaryId);
        }

        await Brand.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting brand',
            error: {
                detail: error.message
            }
        });
    }
});

