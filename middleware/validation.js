const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const validateObjectId = (id) => mongoose.isValidObjectId(id);

exports.validateProduct = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('brandId').trim().notEmpty().withMessage('Brand ID is required').custom(validateObjectId).withMessage('Invalid Brand ID'),
    body('variants').isArray().withMessage('Variants must be an array'),
    body('variants.*.color').trim().notEmpty().withMessage('Color ID is required').custom(validateObjectId).withMessage('Invalid Color ID'),
    body('variants.*.size').trim().notEmpty().withMessage('Size ID is required').custom(validateObjectId).withMessage('Invalid Size ID'),
    body('variants.*.stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('variants.*.imageURL').trim().notEmpty().withMessage('Image URL is required').isURL().withMessage('Invalid Image URL')
];

// Updated validation for product updates - all fields optional
exports.validateProductUpdate = [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('brandId').optional().trim().notEmpty().withMessage('Brand ID cannot be empty').custom(validateObjectId).withMessage('Invalid Brand ID'),
    body('variants').optional().isArray().withMessage('Variants must be an array'),
    body('variants.*.color').optional().trim().notEmpty().withMessage('Color ID cannot be empty').custom(validateObjectId).withMessage('Invalid Color ID'),
    body('variants.*.size').optional().trim().notEmpty().withMessage('Size ID cannot be empty').custom(validateObjectId).withMessage('Invalid Size ID'),
    body('variants.*.stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('variants.*.imageURL').optional().trim().isURL().withMessage('Invalid Image URL')
];

exports.validateBrand = [
    body('name').trim().notEmpty().withMessage('Brand name is required')
];

exports.validateColor = [
    body('name').trim().notEmpty().withMessage('Color name is required')
];

exports.validateSize = [
    body('name').trim().notEmpty().withMessage('Size name is required')
];

exports.validateObjectIdParam = [
    param('id').custom(validateObjectId).withMessage('Invalid ID')
];