const asyncHandler = require('../utils/asyncHandler');
const Color = require('../models/Color');
const { error } = require('winston');

// Create a new color
exports.createColor = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const color = new Color({ name });
    await color.save();
    res.status(201).json({
        success: true,
        data: color,
        message: 'Color created successfully'
    });
});

// Get all colors
exports.getColors = asyncHandler(async (req, res) => {
    const colors = await Color.find();
    res.json({
        success: true,
        data: colors
    });
});

// Update a color
exports.updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const color = await Color.findByIdAndUpdate(id, { name }, { new: true });

    if (!color) {
        return res.status(404).json({ 
            success: false,
            message: 'Color not found',
            error: {
            detail: 'No Color found with id: ${id}'
            }
        });
    }

    res.json({
        success: true,
        data: color,
        message: 'Color updated successfully'
    });
});

// Delete a color
exports.deleteColor = asyncHandler(async (req, res) => {
    const color = await Color.findByIdAndDelete(req.params.id);

    if (!color) {
        return res.status(404).json({
            success: false,
            message: 'Color not found',
            error: {
            detail: 'No Color found with id: ${id}'
            } 
        });
    }

    res.status(200).json({ 
        success: true,
        message: 'Color deleted successfully' 
    });
});