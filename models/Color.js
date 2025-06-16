const mongoose = require('mongoose');


// New Color Model (without imageURL)
const colorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true // Ensure unique colors
    }
}, { timestamps: true });

module.exports = mongoose.model('Color', colorSchema);