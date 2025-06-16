const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    isAdmin: {
        type: Boolean,
        default: true  // Since this is only for admin users
    },
    profilePicture: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;