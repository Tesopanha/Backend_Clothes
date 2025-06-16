const mongoose = require('mongoose');



// New Size Model
const sizeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true // Ensure unique sizes
    }
}, { timestamps: true });

module.exports = mongoose.model('Size', sizeSchema);