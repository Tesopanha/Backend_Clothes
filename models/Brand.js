const mongoose = require('mongoose');

// New Brand Model
const brandSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true // Ensure unique brands
    },
    logoURL: { 
        type: String, 
        required: true 
    },
    cloudinaryId: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);