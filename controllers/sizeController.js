const asyncHandler = require('../utils/asyncHandler');
const Size = require('../models/Size');

// Create a new size
exports.createSize = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const size = new Size({ name });
    await size.save();
    res.status(201).json({
        success: true,
        data: size,
        message:'size created successfully'
    });
});

// Get all sizes
exports.getSizes = asyncHandler(async (req, res) => {
    const sizes = await Size.find();
    res.json({
        success: true,
        data: sizes
    });
});

// Update a size
exports.updateSize = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const size = await Size.findByIdAndUpdate(id, { name }, { new: true });

    if (!size) {
        return res.status(404).json({ 
            success: false,
            message: 'Size not found',
            error: {
                detail: 'No Size was found with id: ${id}'
            }
        });
    }

    res.json({
        success: true,
        data: size,
        message: 'Size updated successfully'
    });
});

// Delete a size
exports.deleteSize = asyncHandler(async (req, res) => {
    const size = await Size.findByIdAndDelete(req.params.id);

    if (!size) {
        return res.status(404).json({ 
            success: false,
            message: 'Size not found',
            error: {
                detail:'No size was found with id: ${id} '
            }
        });
    }

    res.status(200).json({
        success: true,
        message: 'Size deleted successfully' });
});