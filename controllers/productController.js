const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Color = require('../models/Color');
const Size = require('../models/Size');
const { validateIds, validateVariant, validateVariants } = require('../utils/validateIds');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// Create a new product
exports.createProduct = asyncHandler(async (req, res) => {
    const { name, brandId, variants } = req.body;

    // Validate required fields
    if (!name || !brandId || !variants || !Array.isArray(variants)) {
        return res.status(400).json({ 
            success: false,
            message: 'Missing or invalid required fields' 
        });
    }

    // Validate image files in variants
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ 
            success: false,
            message: 'No images uploaded' 
        });
    }

    try {
        // Validate all variants first
        await validateVariants(variants);

        // Map uploaded files to variants and add variantId
        const updatedVariants = variants.map((variant, index) => {
             // Check for both single and multiple image formats
             let variantImages = req.files.filter(file => 
                file.fieldname.startsWith(`files[${index}]`)
            );

            
     // If no images found with array format, check single image format
        if (variantImages.length === 0) {
            variantImages = req.files.filter(file => 
            file.fieldname === `files[${index}]`
        );
        }
 // If still no images, check for single file format
        if (variantImages.length === 0 && req.files[index]) {
            variantImages = [req.files[index]];
        }

        if (variantImages.length === 0) {
            throw new Error(`Missing images for variant ${index + 1}`);
        }
            // if (!req.files[index]) {
            //     throw new Error(`Missing image for variant ${index + 1}`);
            // }
            // Create image objects
        const images = variantImages.map((image, imgIndex) => ({
            imageURL: image.path,
            cloudinaryId: image.filename,
            isMain: imgIndex === 0 // First image is main
        }));

            return {
                ...variant,
                variantId: generateVariantId(),
                colors: variant.colors || [],
                images: images,
                
            };
        });

        // Extract unique color and size IDs from variants
        const colorIds = [...new Set(updatedVariants.flatMap(v => v.colors))];
        const sizeIds = [...new Set(updatedVariants.map(v => v.size))];

        // Validate all IDs
        await validateIds(brandId, colorIds, sizeIds);

        // Create the product
        const product = new Product({ 
            name, 
            brand: brandId, 
            variants: updatedVariants 
        });
        await product.save();

        // Return populated product
        const populatedProduct = await Product.findById(product._id)
            .populate('brand')
            .populate('variants.colors')
            .populate('variants.size');

        res.status(201).json({
            success: true,
            data: populatedProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Get all products
exports.getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};

    if (req.query.brand) {
        filter.brand = req.query.brand;
    }
    
    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(filter)
        .populate('brand')
        .populate('variants.colors')
        .populate('variants.size')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by newest first

    const totalProducts = await Product.countDocuments(filter);
    res.json({
        success: true,
        data:products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page
    });
});

// Get a single product
exports.getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid product ID format'
        });
    }

    const product = await Product.findById(id)
        .populate('brand')
        .populate('variants.colors')
        .populate('variants.size');

    if (!product) {
        return res.status(404).json({ 
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product,
    });
});

// Helper function to generate variantId
const generateVariantId = () => {
    return 'V' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Helper function to check for duplicate variants
const isDuplicateVariant = (variants, newVariant) => {
    return variants.some(variant => 
        variant.size.toString() === newVariant.size.toString() &&
        JSON.stringify(variant.colors.sort()) === JSON.stringify(newVariant.colors.sort())
    );
};

// Update product with new logic
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid product ID format'
        });
    }

    const { name, brandId, variants } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({  
            success: false,
            message: 'Product not found'
        });
    }

    try {
        const updateData = {};
        
        // Update basic product info if provided
        if (name) updateData.name = name;
        if (brandId) {
            // Validate brand exists
            const brand = await Brand.findById(brandId);
            if (!brand) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid brand ID'
                });
            }
            updateData.brand = brandId;
        }

        // Handle variants update if provided
        if (variants && Array.isArray(variants)) {
            const existingVariants = product.variants;
            const updatedVariants = [];

            for (const variantData of variants) {
                let targetVariant;

                // If variantId is provided, find and update existing variant
                if (variantData.variantId) {
                    targetVariant = existingVariants.find(v => v.variantId === variantData.variantId);
                    if (!targetVariant) {
                        return res.status(404).json({
                            success: false,
                            message: `Variant with ID ${variantData.variantId} not found`
                        });
                    }
                } else {
                    // New variant - validate it
                    await validateVariant(variantData);
                    
                    // Create new variant with generated ID
                    targetVariant = {
                        variantId: generateVariantId(),
                        size: variantData.size,
                        colors: variantData.colors,
                        stock: variantData.stock || 0,
                        images: []
                    };
                }

                // Update only provided fields
                if (variantData.size) targetVariant.size = variantData.size;
                if (variantData.stock !== undefined) targetVariant.stock = variantData.stock;
                if (variantData.colors) targetVariant.colors = variantData.colors;

                // Handle image update if provided
                if (req.files && req.files[updatedVariants.length]) {
                     // Delete old images from Cloudinary
                     if (targetVariant.images && targetVariant.images.length > 0) {
                        for (const image of targetVariant.images) {
                            if (image.cloudinaryId) {
                                await cloudinary.uploader.destroy(image.cloudinaryId);
                            }
                        }
                    }
                      // Create new image objects
                      const newImages = req.files.map((file, index) => ({
                        imageURL: file.path,
                        cloudinaryId: file.filename,
                        isMain: index === 0
                    }));

                    targetVariant.images = newImages;
                }

                updatedVariants.push(targetVariant);
            }

            // Validate all variants together for duplicates
            await validateVariants(updatedVariants);

            // Keep variants that weren't updated
            const unchangedVariants = existingVariants.filter(v => 
                !variants.some(uv => uv.variantId === v.variantId)
            );

            updateData.variants = [...unchangedVariants, ...updatedVariants];
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('brand')
         .populate('variants.colors')
         .populate('variants.size');

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid product ID format'
        });
    }

    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({ 
            success: false,
            message: 'Product not found'
        });
    }

    // Delete all associated images from Cloudinary
    for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
            for (const image of variant.images) {
                if (image.cloudinaryId) {
                    await cloudinary.uploader.destroy(image.cloudinaryId);
                }
            }
        }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ 
        success: true,
        message: 'Product deleted successfully' 
    });
});

// Update a specific variant's image
exports.updateVariantImage = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;
    
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ 
            success: false,
            message: 'No images provided' 
        });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
        return res.status(404).json({ 
            success: false,
            message: 'Product not found'
        });
    }
    
    const variant = product.variants.find(v => v.variantId === variantId);
    if (!variant) {
        return res.status(404).json({ 
            success: false,
            message: 'Variant not found' 
        });
    }
    
   
    // Delete old images from Cloudinary
    if (variant.images && variant.images.length > 0) {
        for (const image of variant.images) {
            if (image.cloudinaryId) {
                await cloudinary.uploader.destroy(image.cloudinaryId);
            }
        }
    }
    
    // Add new images (first is main)
    const newImages = req.files.map((file, index) => ({
        imageURL: file.path,
        cloudinaryId: file.filename,
        isMain: index === 0
    }));
    
   // Update variant images
   variant.images = newImages;
   await product.save();
    
    const updatedProduct = await Product.findById(productId)
        .populate('brand')
        .populate('variants.colors')
        .populate('variants.size');
    
    res.json({
        success: true,
        data: updatedProduct,
        message: 'Image updated successfully'
    });
});

